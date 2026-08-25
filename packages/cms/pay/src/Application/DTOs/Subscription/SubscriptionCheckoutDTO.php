<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Subscription;

use Cms\Pay\Application\DTOs\Payment\PaymentDTO;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\Subscription;
use Spatie\LaravelData\Data;

/**
 * Результат оформления подписки: сама подписка и платёж первого периода.
 * Заменяет нетипизированный `array{subscription, payment}` из SubscribeHandler.
 */
final class SubscriptionCheckoutDTO extends Data
{
    public function __construct(
        public SubscriptionDTO $subscription,
        public PaymentDTO $payment,
    ) {}

    public static function fromModels(Subscription $subscription, Payment $payment): self
    {
        return new self(
            subscription: SubscriptionDTO::fromModel($subscription),
            payment: PaymentDTO::fromModel($payment),
        );
    }
}
