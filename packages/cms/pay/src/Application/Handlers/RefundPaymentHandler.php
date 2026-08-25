<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\RefundPaymentCommand;
use Cms\Pay\Application\Exceptions\PaymentNotRefundable;
use Cms\Pay\Application\Exceptions\RefundExceedsRefundable;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Events\PaymentRefunded;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Infrastructure\Gateways\ProviderRegistry;
use Cms\Shared\Values\Money;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Support\Facades\DB;
use Psr\Log\LoggerInterface;
use Spatie\LaravelData\Optional;

/**
 * Возврат по платежу: проверка доменных инвариантов, вызов провайдера,
 * запись возврата. Проводка леджера и событие аналитики — синхронные
 * листенеры `PaymentRefunded` (И8).
 *
 * Вызов провайдера сознательно ВНЕ транзакции: держать блокировки БД на
 * время внешнего HTTP-вызова нельзя. Дефект «возврат у провайдера сделан,
 * а запись упала» (Д2) закрыт восстановимостью: транзакция ретраится
 * (attempts: 3), а её падение после успешного возврата оставляет критический
 * лог с полным контекстом для ручной сверки — молча факт возврата не теряется.
 */
final class RefundPaymentHandler
{
    public function __construct(
        private readonly ProviderRegistry $providers,
        private readonly Dispatcher $events,
        private readonly LoggerInterface $logger,
    ) {}

    public function handle(RefundPaymentCommand $command): Payment
    {
        $payment = $command->payment;
        $refundable = $payment->refundable();
        // Отсутствующий amount_minor — полный возврат остатка, а не нулевой (И1).
        $amount = $command->data->amount_minor instanceof Optional
            ? $refundable
            : Money::of($command->data->amount_minor, $payment->currency);

        // Возврат меньше минорной единицы и возврат сверх остатка одинаково запрещены.
        if ($amount->amountMinor < 1 || $refundable->subtract($amount)->isNegative()) {
            throw RefundExceedsRefundable::make();
        }

        if (! in_array($payment->status, [PaymentStatus::Succeeded, PaymentStatus::RefundedPartial], true)) {
            throw PaymentNotRefundable::make();
        }

        $this->providers->for($payment->project_id, $payment->provider)->refund($payment, $amount);

        try {
            return DB::transaction(function () use ($payment, $amount) {
                $payment->refunded_minor += $amount->amountMinor;
                // Возвращено всё — RefundedFull; остаток положительный — RefundedPartial.
                $payment->status = $payment->refundable()->isNegative() || $payment->refundable()->isZero()
                    ? PaymentStatus::RefundedFull
                    : PaymentStatus::RefundedPartial;
                $payment->save();

                $this->events->dispatch(new PaymentRefunded($payment, $amount));

                return $payment;
            }, 3);
        } catch (\Throwable $e) {
            // Деньги у провайдера уже возвращены, а запись не сохранилась даже
            // с ретраями — след для ручной сверки, затем исключение наружу.
            $this->logger->critical('pay.refund.persist_failed', [
                'payment_id' => $payment->id,
                'provider' => $payment->provider,
                'amount_minor' => $amount->amountMinor,
                'currency' => $amount->currency->code,
            ]);

            throw $e;
        }
    }
}
