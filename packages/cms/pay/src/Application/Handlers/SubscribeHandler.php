<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Contracts\Events\SubscriptionStarted;
use Cms\Pay\Application\Commands\CreatePaymentCommand;
use Cms\Pay\Application\Commands\SubscribeCommand;
use Cms\Pay\Application\DTOs\Payment\CreatePaymentDTO;
use Cms\Pay\Application\DTOs\Subscription\SubscriptionCheckoutDTO;
use Cms\Pay\Application\Exceptions\SubscriptionAlreadyExists;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Analytics\Analytics;
use Illuminate\Contracts\Events\Dispatcher;

/** Оформление подписки: создаётся подписка и платёж первого периода. */
final class SubscribeHandler
{
    public function __construct(
        private readonly CreatePaymentHandler $createPayment,
        private readonly Dispatcher $events,
    ) {}

    public function handle(SubscribeCommand $command): SubscriptionCheckoutDTO
    {
        $subject = $command->subject;
        $subjectType = $subject->getMorphClass();
        $subjectId = (string) $subject->getKey();

        // Анти-дубль: одна живая подписка на пару подписчик+предмет
        $exists = Subscription::query()
            ->where('subscriber_type', $command->subscriber->type)
            ->where('subscriber_id', $command->subscriber->id)
            ->where('subject_type', $subjectType)
            ->where('subject_id', $subjectId)
            ->whereIn('status', ['active', 'past_due', 'paused'])
            ->exists();
        if ($exists) {
            throw SubscriptionAlreadyExists::make();
        }

        $subscription = Subscription::create([
            'subscriber_type' => $command->subscriber->type,
            'subscriber_id' => $command->subscriber->id,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'current_period_ends_at' => now()->add($subject->subscriptionInterval()),
        ]);

        // Оптимистично, до платежа первого периода (Д15): licensing выпускает
        // лицензию на оформление, как и site-подписка появляется сразу
        $this->events->dispatch(new SubscriptionStarted(
            subscriptionId: $subscription->id,
            projectId: $subscription->project_id,
            subscriberType: $command->subscriber->type,
            subscriberId: $command->subscriber->id,
            subjectType: $subjectType,
            subjectId: $subjectId,
            periodEndsAt: $subscription->current_period_ends_at->toIso8601String(),
        ));

        $subjectKey = $command->subscriber->subjectKey($subscription->project_id);
        $price = $subject->subscriptionPrice();
        $paymentData = [
            'amount_minor' => $price->amountMinor,
            'currency' => $price->currency->code,
            'description' => "Subscription {$subject->subscriptionCode()}",
        ];
        if ($command->provider !== null) {
            $paymentData['provider'] = $command->provider;
        }

        $payment = $this->createPayment->handle(new CreatePaymentCommand(
            subjectKey: $subjectKey,
            data: CreatePaymentDTO::from($paymentData),
            idempotencyKey: "sub:{$subscription->id}:initial",
            subscriptionId: $subscription->id,
        ));

        Analytics::push($subjectKey, [
            'name' => 'subscription.created',
            'props' => ['plan' => $subject->subscriptionCode(), 'subscription_id' => $subscription->id],
        ], $subscription->project_id);

        return SubscriptionCheckoutDTO::fromModels($subscription->fresh('subject') ?? $subscription, $payment);
    }
}
