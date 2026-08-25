<?php

declare(strict_types=1);

namespace Cms\Pay\Infrastructure\Providers;

use Cms\Pay\Domain\Contracts\PaymentProvider;
use Cms\Pay\Domain\Models\Payment;
use Cms\Shared\Values\Money;
use Illuminate\Http\Request;

/** Тестовый провайдер: мгновенный успех; вебхук подписан заголовком X-Null-Signature. */
final class NullProvider implements PaymentProvider
{
    public function key(): string
    {
        return 'null';
    }

    public function createPayment(Payment $payment): array
    {
        return ['external_id' => 'null-'.$payment->id, 'redirect_url' => null, 'status' => 'pending'];
    }

    public function refund(Payment $payment, Money $amount): array
    {
        return ['external_id' => 'null-refund-'.$payment->id, 'status' => 'refunded'];
    }

    public function verifyWebhook(Request $request): bool
    {
        return hash_equals('valid-signature', (string) $request->header('X-Null-Signature'));
    }

    public function parseWebhook(array $payload): array
    {
        return [
            'external_id' => (string) ($payload['id'] ?? ''),
            'status' => (string) ($payload['status'] ?? 'unknown'),
            'payment_id' => $payload['payment_id'] ?? null,
        ];
    }
}
