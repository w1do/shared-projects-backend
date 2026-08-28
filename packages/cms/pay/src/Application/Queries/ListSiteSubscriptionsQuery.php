<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Queries;

use Cms\Pay\Application\DTOs\Subscription\SubscriptionDTO;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Pay\Domain\Policies\SubscriptionPolicy;
use Cms\Shared\Billing\Subscriber;
use Illuminate\Support\Collection;

/**
 * Подписки подписчика. Форма ответа не меняется (И5): непагинированная
 * коллекция без `meta` — курсор здесь молча обрезал бы список (guard 0.6).
 */
final class ListSiteSubscriptionsQuery
{
    public function __construct(private readonly SubscriptionPolicy $policy) {}

    /** @return Collection<int, SubscriptionDTO> */
    public function handle(Subscriber $subscriber): Collection
    {
        return $this->policy->ownedBy(Subscription::query()->with('subject'), $subscriber)
            ->get()
            ->map(SubscriptionDTO::fromModel(...));
    }
}
