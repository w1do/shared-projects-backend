<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Contracts;

use Cms\Pay\Domain\Models\Payment;
use Cms\Shared\Values\Money;
use Illuminate\Http\Request;

/** Порт платёжного провайдера — единственный путь наружу. */
interface PaymentProvider
{
    public function key(): string;

    /** @return array{external_id: ?string, redirect_url: ?string, status: string} */
    public function createPayment(Payment $payment): array;

    /** @return array{external_id: ?string, status: string} */
    public function refund(Payment $payment, Money $amount): array;

    public function verifyWebhook(Request $request): bool;

    /** @return array{external_id: string, status: string, payment_id: ?string} */
    public function parseWebhook(array $payload): array;
}
