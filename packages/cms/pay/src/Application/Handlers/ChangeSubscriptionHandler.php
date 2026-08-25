<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\ChangeSubscriptionCommand;
use Cms\Pay\Domain\Enums\SubscriptionAction;
use Cms\Pay\Domain\Enums\SubscriptionStatus;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Analytics\Analytics;

/** cancel — доступ до конца оплаченного периода; resume; pause; delete — soft-delete. */
final class ChangeSubscriptionHandler
{
    public function handle(ChangeSubscriptionCommand $command): Subscription
    {
        $subscription = $command->subscription;

        // Набор действий закрыт enum'ом: ветки default больше нет, неизвестное
        // действие отсеивается на границе (маршрут admin / контроллер site).
        match ($command->action) {
            SubscriptionAction::Cancel => $this->apply($subscription, SubscriptionStatus::Canceled, 'canceled_at'),
            SubscriptionAction::Resume => $this->resume($subscription),
            SubscriptionAction::Pause => $this->apply($subscription, SubscriptionStatus::Paused, 'paused_at'),
            SubscriptionAction::Delete => $subscription->delete(), // история и леджер сохраняются
        };

        Analytics::push($subscription->user_key, [
            'name' => "subscription.{$command->action->value}",
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
