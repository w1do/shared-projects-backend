<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\ApplyPaymentStatusCommand;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Enums\SubscriptionStatus;
use Cms\Pay\Domain\Enums\TransactionType;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Analytics\Analytics;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/** Единственная точка смены статуса платежа: леджер, продление подписки, событие в аналитику. */
final class ApplyPaymentStatusHandler
{
    public function handle(ApplyPaymentStatusCommand $command): Payment
    {
        $payment = $command->payment;
        $target = $command->status;

        if ($payment->status === $target) {
            return $payment; // идемпотентность: повторный вебхук без эффекта
        }

        if (! $payment->status->canTransitionTo($target)) {
            throw ValidationException::withMessages([
                'status' => ["Transition {$payment->status->value} → {$target->value} is not allowed."],
            ]);
        }

        return DB::transaction(function () use ($payment, $target) {
            $payment->status = $target;
            $payment->save();

            if ($target === PaymentStatus::Succeeded) {
                $payment->transactions()->create([
                    'project_id' => $payment->project_id,
                    'type' => TransactionType::Charge,
                    'amount_minor' => $payment->amount_minor,
                    'currency' => $payment->currency,
                    'created_at' => now(),
                ]);

                if ($payment->subscription_id !== null) {
                    $this->extendSubscription($payment);
                }
            }

            Analytics::push($payment->user_key, [
                'name' => $target === PaymentStatus::Succeeded ? 'payment.succeeded' : "payment.{$target->value}",
                'value_minor' => $target === PaymentStatus::Succeeded ? $payment->amount_minor : 0,
                'currency' => $payment->currency,
                'props' => ['payment_id' => $payment->id],
            ], $payment->project_id);

            return $payment;
        });
    }

    private function extendSubscription(Payment $payment): void
    {
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
