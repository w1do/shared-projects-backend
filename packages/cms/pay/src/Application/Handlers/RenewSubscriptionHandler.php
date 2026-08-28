<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\CreatePaymentCommand;
use Cms\Pay\Application\Commands\RenewSubscriptionCommand;
use Cms\Pay\Application\DTOs\Payment\CreatePaymentDTO;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Enums\SubscriptionStatus;
use Cms\Pay\Domain\Models\Payment;
use Cms\Shared\Billing\Subscribable;

/** Продление: идемпотентный платёж за период; неуспех → past_due и ретраи. */
final class RenewSubscriptionHandler
{
    public function __construct(private readonly CreatePaymentHandler $createPayment) {}

    public function handle(RenewSubscriptionCommand $command): Payment
    {
        $subscription = $command->subscription->loadMissing('subject');
        $subject = $subscription->subject;
        if (! $subject instanceof Subscribable) {
            throw new \LogicException("Subscription {$subscription->id} has no subscribable subject.");
        }
        $periodKey = $subscription->current_period_ends_at->format('Ymd');

        $price = $subject->subscriptionPrice();
        $payment = $this->createPayment->handle(new CreatePaymentCommand(
            subjectKey: $subscription->subscriber()->subjectKey($subscription->project_id),
            data: CreatePaymentDTO::from([
                'amount_minor' => $price->amountMinor,
                'currency' => $price->currency->code,
                'description' => "Renewal {$subject->subscriptionCode()}",
            ]),
            idempotencyKey: "sub:{$subscription->id}:renew:{$periodKey}",
            subscriptionId: $subscription->id,
        ));

        if ($payment->status === PaymentStatus::Failed) {
            $subscription->transitionTo(SubscriptionStatus::PastDue);
            $subscription->renewal_attempts++;
            $subscription->save();
        }

        return $payment;
    }
}
