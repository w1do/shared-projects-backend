<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Listeners;

use Cms\Pay\Domain\Enums\SubscriptionStatus;
use Cms\Pay\Domain\Events\PaymentSucceeded;
use Cms\Pay\Domain\Models\Subscription;

/**
 * Продление подписки успешным платежом периода.
 *
 * База сдвига — прежний конец периода, только если он ещё в будущем; иначе
 * `now()`, то есть просрочка НЕ компенсируется. Это зафиксированное поведение
 * (guard 0.7), а не упрощение: менять его здесь нельзя.
 */
final class ExtendSubscriptionPeriod
{
    public function handle(PaymentSucceeded $event): void
    {
        $payment = $event->payment;
        if ($payment->subscription_id === null) {
            return;
        }

        $subscription = Subscription::query()->with('plan')->find($payment->subscription_id);
        if ($subscription === null) {
            return;
        }

        $plan = $subscription->plan;
        if ($plan === null) {
            return;
        }

        $base = $subscription->current_period_ends_at->isFuture()
            ? $subscription->current_period_ends_at
            : now();

        $subscription->forceFill([
            'current_period_ends_at' => $base->add($plan->periodInterval()),
            'status' => SubscriptionStatus::Active,
            'renewal_attempts' => 0,
        ])->save();
    }
}
