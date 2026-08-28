<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Payment;

use Cms\Pay\Domain\Models\Payment;
use Spatie\LaravelData\Data;

final class PaymentDTO extends Data
{
    public function __construct(
        public string $id,
        public string $user_key,
        public int $amount_minor,
        public int $refunded_minor,
        public string $currency,
        public string $status,
        public string $provider,
        public ?string $redirect_url,
        public ?string $description,
        public ?string $subscription_id,
        public ?string $created_at,
    ) {}

    public static function fromModel(Payment $payment): self
    {
        return new self(
            id: $payment->id,
            user_key: $payment->user_key,
            amount_minor: $payment->amount_minor,
            refunded_minor: $payment->refunded_minor,
            currency: $payment->currency,
            status: $payment->status->value,
            provider: $payment->provider,
            redirect_url: $payment->redirect_url,
            description: $payment->description,
            subscription_id: $payment->subscription_id,
            created_at: $payment->created_at?->toIso8601String(),
        );
    }
}
