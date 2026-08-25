<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\ChangeSubscriptionCommand;
use Cms\Pay\Domain\Enums\SubscriptionStatus;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Analytics\Analytics;
use Illuminate\Validation\ValidationException;

/** cancel — доступ до конца оплаченного периода; resume; pause; delete — soft-delete. */
final class ChangeSubscriptionHandler
{
    public function handle(ChangeSubscriptionCommand $command): Subscription
    {
        $subscription = $command->subscription;

        match ($command->action) {
            'cancel' => $this->apply($subscription, SubscriptionStatus::Canceled, 'canceled_at'),
            'resume' => $this->resume($subscription),
            'pause' => $this->apply($subscription, SubscriptionStatus::Paused, 'paused_at'),
            'delete' => $subscription->delete(), // история и леджер сохраняются
            default => throw ValidationException::withMessages(['action' => ['Unknown action.']]),
        };

        Analytics::push($subscription->user_key, [
            'name' => "subscription.{$command->action}",
            'props' => ['subscription_id' => $subscription->id],
        ], $subscription->project_id);

        return $subscription->fresh('plan') ?? $subscription;
    }

    private function apply(Subscription $subscription, SubscriptionStatus $status, string $stampField): void
    {
        $subscription->transitionTo($status);
        $subscription->forceFill([$stampField => now()])->save();
    }

    private function resume(Subscription $subscription): void
    {
        $subscription->transitionTo(SubscriptionStatus::Active);
        $subscription->forceFill(['paused_at' => null, 'canceled_at' => null])->save();
    }
}
