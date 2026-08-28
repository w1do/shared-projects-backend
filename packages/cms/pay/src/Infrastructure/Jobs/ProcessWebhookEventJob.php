<?php

declare(strict_types=1);

namespace Cms\Pay\Infrastructure\Jobs;

use Cms\Pay\Application\Commands\ApplyPaymentStatusCommand;
use Cms\Pay\Application\Exceptions\ProviderNotConfigured;
use Cms\Pay\Application\Handlers\ApplyPaymentStatusHandler;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\WebhookEvent;
use Cms\Pay\Infrastructure\Gateways\ProviderWebhookGateway;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

/**
 * Обработка вебхука в очереди: идемпотентно, с ретраями; HTTP уже ответил 200.
 *
 * Джоба НЕ наследует общий `Cms\Shared\Jobs\ProjectAwareJob` (задача 7.8) —
 * это невозможно по двум причинам сразу:
 *  1. `ProjectAwareJob` требует `__construct(string $projectId)`, а проект
 *     вебхука определяется только ПОСЛЕ загрузки платежа по payload'у,
 *     то есть внутри handle(), а не до постановки в очередь: регистрация
 *     могла его не зарезолвить (`WebhookEvent.project_id` nullable, Д4);
 *  2. `ProjectAwareJob::handle()` объявлен final и без аргументов, что
 *     несовместимо с инъекцией `ProviderRegistry`/`ApplyPaymentStatusHandler`.
 * Решение зеркалит `ExportReportJob` в analytics (задача 2.7).
 */
final class ProcessWebhookEventJob implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;

    public int $tries = 5;

    public int $timeout = 60;

    /** @var list<int> */
    public array $backoff = [5, 30, 120, 600];

    public function __construct(public readonly int $webhookEventId) {}

    public function uniqueId(): string
    {
        return (string) $this->webhookEventId;
    }

    public function handle(ProviderWebhookGateway $gateway, ApplyPaymentStatusHandler $apply): void
    {
        $event = WebhookEvent::query()->find($this->webhookEventId);
        if ($event === null || $event->status === 'processed') {
            return;
        }

        $parsed = $gateway->parse($event->provider, $event->payload);

        $payment = null;
        if (is_string($parsed['payment_id'])) {
            $payment = Payment::acrossProjects()->whereKey($parsed['payment_id'])->first();
        }

        // Реальные провайдеры не знают внутренний payment_id: платёж
        // резолвится по внешнему идентификатору транзакции (Д6)
        if ($payment === null && $parsed['external_id'] !== '') {
            $payment = Payment::acrossProjects()
                ->where('provider', $event->provider)
                ->where('provider_ref', $parsed['external_id'])
                ->first();
        }

        if ($payment === null) {
            // Платёж не зарезолвился — project_id события остаётся NULL
            $event->forceFill(['status' => 'failed'])->save();

            return;
        }

        // Тенант-колонка проставляется при обработке: регистрация могла
        // не увидеть платёж (сохранится вместе с финальным статусом)
        $event->forceFill(['project_id' => $payment->project_id]);

        // Д6: подлинность секрета — только теперь, с credentials проекта;
        // невалидный секрет (или архив/отсутствие настроек) отклоняет
        // событие до применения статуса
        try {
            $verified = $gateway->verifyDeferredAuth($event->provider, $payment->project_id, $event->auth);
        } catch (ProviderNotConfigured) {
            $verified = false;
        }

        if (! $verified) {
            $event->forceFill(['status' => 'failed'])->save();

            return;
        }

        $status = PaymentStatus::tryFrom((string) $parsed['status']);
        if ($status !== null) {
            app(ProjectContext::class)->set($payment->project_id);
            try {
                $apply->handle(new ApplyPaymentStatusCommand($payment, $status));
            } finally {
                app(ProjectContext::class)->clear();
            }
        }

        $event->forceFill(['status' => 'processed'])->save();
    }

    public function failed(\Throwable $e): void
    {
        Log::error('webhook processing failed permanently', ['event_id' => $this->webhookEventId, 'exception' => $e->getMessage()]);
    }
}
