<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Queries;

use Cms\Pay\Domain\Models\Subscription;
use Cms\Pay\Domain\Policies\SubscriptionPolicy;
use Cms\Shared\Billing\Subscriber;

/**
 * Подписка подписчика по id. Условие владения остаётся в самом
 * lookup'е (И11): чужая подписка не находится и даёт 404, а не 403.
 */
final class FindSiteSubscriptionQuery
{
    public function __construct(private readonly SubscriptionPolicy $policy) {}

    public function handle(Subscriber $subscriber, string $subscriptionId): Subscription
    {
        return $this->policy->ownedBy(Subscription::query()->with('subject'), $subscriber)
            ->findOrFail($subscriptionId);
    }
}
