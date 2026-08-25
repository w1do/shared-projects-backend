<?php

declare(strict_types=1);

namespace Cms\Pay\Infrastructure\Gateways;

use Cms\Pay\Domain\Contracts\PaymentProvider;
use Cms\Pay\Domain\Models\Payment;
use Cms\Shared\Values\Money;
use Illuminate\Http\Request;

/**
 * Оплата по счёту: платёж ждёт подтверждения оператором.
 * Подтверждение идёт тем же путём ApplyPaymentStatus, что и у онлайн-провайдера.
 */
final class ManualProvider implements PaymentProvider
{
    public function key(): string
    {
        return 'manual';
    }

    public function configure(array $credentials): static
    {
        // Ручному провайдеру внешний конфиг не нужен
        return $this;
    }

    public function createPayment(Payment $payment): array
    {
        return ['external_id' => 'manual-'.$payment->id, 'redirect_url' => null, 'status' => 'pending'];
    }

    public function refund(Payment $payment, Money $amount): array
    {
        return ['external_id' => 'manual-refund-'.$payment->id, 'status' => 'refunded'];
    }

    public function verifyWebhook(Request $request): bool
    {
        // Ручной провайдер не шлёт вебхуки
        return false;
    }

    public function parseWebhook(array $payload): array
    {
        return ['external_id' => '', 'status' => 'unknown', 'payment_id' => null];
    }
}
