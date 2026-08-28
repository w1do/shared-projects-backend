<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Listeners;

use Cms\Contracts\Events\SubscriptionPeriodExtended;
use Cms\Pay\Domain\Enums\SubscriptionStatus;
use Cms\Pay\Domain\Events\PaymentSucceeded;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Billing\Subscribable;
use Illuminate\Contracts\Events\Dispatcher;

/**
 * Продление подписки успешным платежом периода.
 *
 * База сдвига — прежний конец периода, только если он ещё в будущем; иначе
 * `now()`, то есть просрочка НЕ компенсируется. Это зафиксированное поведение
 * (guard 0.7), а не упрощение: менять его здесь нельзя.
 */
final class ExtendSubscriptionPeriod
{
    public function __construct(private readonly Dispatcher $events) {}

    public function handle(PaymentSucceeded $event): void
    {
        $payment = $event->payment;
        if ($payment->subscription_id === null) {
            return;
        }

        $subscription = Subscription::query()->with('subject')->find($payment->subscription_id);
        if ($subscription === null) {
            return;
        }

        $subject = $subscription->subject;
        if (! $subject instanceof Subscribable) {
            return;
        }

        $base = $subscription->current_period_ends_at->isFuture()
            ? $subscription->current_period_ends_at
            : now();

        $subscription->forceFill([
            'current_period_ends_at' => $base->add($subject->subscriptionInterval()),
            'status' => SubscriptionStatus::Active,
            'renewal_attempts' => 0,
        ])->save();

        // Licensing перевыпускает лицензию с новым сроком — синхронно (И8)
        $this->events->dispatch(new SubscriptionPeriodExtended(
            subscriptionId: $subscription->id,
            projectId: $subscription->project_id,
            subscriberType: $subscription->subscriber_type,
            subscriberId: $subscription->subscriber_id,
            subjectType: $subscription->subject_type,
            subjectId: $subscription->subject_id,
            periodEndsAt: $subscription->current_period_ends_at->toIso8601String(),
        ));
    }
}
