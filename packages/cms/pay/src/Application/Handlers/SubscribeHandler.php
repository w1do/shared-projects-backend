<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\CreatePaymentCommand;
use Cms\Pay\Application\Commands\SubscribeCommand;
use Cms\Pay\Application\DTOs\Payment\CreatePaymentDTO;
use Cms\Pay\Application\DTOs\Subscription\SubscriptionCheckoutDTO;
use Cms\Pay\Application\Exceptions\PlanNotAvailable;
use Cms\Pay\Application\Exceptions\SubscriptionAlreadyExists;
use Cms\Pay\Domain\Models\Plan;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Analytics\Analytics;

/** Оформление подписки: создаётся подписка и платёж первого периода. */
final class SubscribeHandler
{
    public function __construct(private readonly CreatePaymentHandler $createPayment) {}

    public function handle(SubscribeCommand $command): SubscriptionCheckoutDTO
    {
        $plan = Plan::query()->where('code', $command->planCode)->whereNull('archived_at')->first();
        if ($plan === null) {
            throw PlanNotAvailable::make();
        }

        $exists = Subscription::query()
            ->where('user_key', $command->userKey->value)
            ->where('plan_id', $plan->id)
            ->whereIn('status', ['active', 'past_due', 'paused'])
            ->exists();
        if ($exists) {
            throw SubscriptionAlreadyExists::make();
        }

        $subscription = Subscription::create([
            'user_key' => $command->userKey->value,
            'plan_id' => $plan->id,
            'current_period_ends_at' => now()->add($plan->periodInterval()),
        ]);

        $price = $plan->price();
        $payment = $this->createPayment->handle(new CreatePaymentCommand(
            userKey: $command->userKey->value,
            data: CreatePaymentDTO::from([
                'amount_minor' => $price->amountMinor,
                'currency' => $price->currency->code,
                'description' => "Subscription {$plan->code}",
            ]),
            idempotencyKey: "sub:{$subscription->id}:initial",
            subscriptionId: $subscription->id,
        ));

        Analytics::push($command->userKey->value, [
            'name' => 'subscription.created',
            'props' => ['plan' => $plan->code, 'subscription_id' => $subscription->id],
        ], $subscription->project_id);

        return SubscriptionCheckoutDTO::fromModels($subscription->fresh('plan') ?? $subscription, $payment);
    }
}
