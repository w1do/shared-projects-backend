<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Subscription;

use Cms\Pay\Application\DTOs\Plan\PlanDTO;
use Cms\Pay\Domain\Models\Subscription;
use Spatie\LaravelData\Data;

final class SubscriptionDTO extends Data
{
    public function __construct(
        public string $id,
        public string $user_key,
        public string $status,
        public bool $grants_access,
        public ?string $current_period_ends_at,
        public ?PlanDTO $plan = null,
    ) {}

    public static function fromModel(Subscription $subscription): self
    {
        return new self(
            id: $subscription->id,
            user_key: $subscription->user_key,
            status: $subscription->status->value,
            grants_access: $subscription->status->grantsAccess() && ! $subscription->trashed(),
            current_period_ends_at: $subscription->current_period_ends_at->toIso8601String(),
            plan: $subscription->relationLoaded('plan') && $subscription->plan
                ? PlanDTO::fromModel($subscription->plan->loadMissing(['options', 'features']))
                : null,
        );
    }
}
