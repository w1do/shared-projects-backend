<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\ApplyPaymentStatusCommand;
use Cms\Pay\Application\Commands\CreatePaymentCommand;
use Cms\Pay\Application\Exceptions\ProviderNotConfigured;
use Cms\Pay\Application\Exceptions\ProviderRequestFailed;
use Cms\Pay\Application\Listeners\PaymentAnalyticsProps;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Pay\Domain\Settings\PaymentsSettings;
use Cms\Pay\Infrastructure\Gateways\ProviderRegistry;
use Cms\Shared\Analytics\Analytics;
use Cms\Shared\Settings\ProjectSettingsProvisioner;
use Cms\Shared\Tenant\ProjectContext;
use Spatie\LaravelData\Optional;

/**
 * Создание платежа: идемпотентно по ключу, проведение через адаптер
 * провайдера. Провайдер по умолчанию — из настроек платежей проекта (Д7),
 * ошибка шлюза переводит платёж в failed и фиксируется в настройках
 * провайдера как `last_error`; след — событие `payment.initiated` (Д8).
 */
final class CreatePaymentHandler
{
    public function __construct(
        private readonly ProviderRegistry $providers,
        private readonly ProjectContext $context,
        private readonly ProjectSettingsProvisioner $provisioner,
        private readonly PaymentsSettings $settings,
        private readonly ApplyPaymentStatusHandler $applyStatus,
    ) {}

    public function handle(CreatePaymentCommand $command): Payment
    {
        if ($command->idempotencyKey !== null) {
            $existing = Payment::query()->where('idempotency_key', $command->idempotencyKey)->first();
            if ($existing !== null) {
                return $existing; // повтор с тем же ключом — без второго платежа
            }
        }

        $data = $command->data;
        $providerKey = $data->provider instanceof Optional ? $this->defaultProvider() : $data->provider;

        // Адаптер резолвится до создания платежа: архивные настройки
        // провайдера — доменная ошибка, локальный платёж не появляется.
        $provider = $this->providers->for($this->context->required(), $providerKey);

        $payment = Payment::create([
            'subject_key' => $command->subjectKey,
            'amount_minor' => $data->amount_minor,
            'currency' => $data->currency,
            'description' => $data->description instanceof Optional ? null : $data->description,
            'provider' => $providerKey,
            'idempotency_key' => $command->idempotencyKey,
            'subscription_id' => $command->subscriptionId,
        ]);

        $this->pushInitiated($payment);

        try {
            $result = $provider->createPayment($payment);
        } catch (ProviderNotConfigured $exception) {
            // Внешняя транзакция не создана; локальный платёж закрывается failed
            $this->applyStatus->handle(new ApplyPaymentStatusCommand($payment, PaymentStatus::Failed));

            throw $exception;
        } catch (ProviderRequestFailed $exception) {
            $this->recordProviderError($payment, $providerKey, $exception);
            $this->applyStatus->handle(new ApplyPaymentStatusCommand($payment, PaymentStatus::Failed));

            return $payment;
        }

        $payment->forceFill([
            'provider_ref' => $result['external_id'],
            'redirect_url' => $result['redirect_url'],
            'status' => $result['status'],
        ])->save();

        return $payment;
    }

    private function defaultProvider(): string
    {
        $this->provisioner->ensure(PaymentsSettings::group(), PaymentsSettings::defaults());

        return $this->settings->provider;
    }

    private function pushInitiated(Payment $payment): void
    {
        Analytics::push($payment->subject_key, [
            'name' => 'payment.initiated',
            'value_minor' => $payment->amount_minor,
            'currency' => $payment->currency,
            'props' => PaymentAnalyticsProps::for($payment),
        ], $payment->project_id);
    }

    /** Компактный `last_error` в properties настроек провайдера; перетирается следующей ошибкой (Д7). */
    private function recordProviderError(Payment $payment, string $providerKey, ProviderRequestFailed $exception): void
    {
        $account = ProviderAccount::query()->where('provider', $providerKey)->first();
        if ($account === null) {
            return;
        }

        $code = $exception->errorCode
            ?? ($exception->status !== null ? "http_{$exception->status}" : 'unreachable');

        $account->properties = array_replace($account->properties ?? [], [
            'last_error' => [
                'code' => $code,
                'message' => $exception->getMessage(),
                'occurred_at' => now()->toIso8601String(),
                'payment_id' => $payment->id,
            ],
        ]);
        $account->save();
    }
}
