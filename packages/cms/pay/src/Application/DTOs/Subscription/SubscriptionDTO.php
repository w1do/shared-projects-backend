<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Subscription;

use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Billing\Subscribable;
use Illuminate\Database\Eloquent\Model;
use Spatie\LaravelData\Data;

final class SubscriptionDTO extends Data
{
    public function __construct(
        public string $id,
        public SubscriberDTO $subscriber,
        public string $status,
        public bool $grants_access,
        public ?string $current_period_ends_at,
        public ?SubscriptionSubjectDTO $subject = null,
    ) {}

    public static function fromModel(Subscription $subscription): self
    {
        $subject = $subscription->relationLoaded('subject') ? $subscription->subject : null;

        return new self(
            id: $subscription->id,
            subscriber: SubscriberDTO::fromSubscriber($subscription->subscriber()),
            status: $subscription->status->value,
            grants_access: $subscription->status->grantsAccess() && ! $subscription->trashed(),
            current_period_ends_at: $subscription->current_period_ends_at->toIso8601String(),
            subject: $subject instanceof Model && $subject instanceof Subscribable
                ? SubscriptionSubjectDTO::fromSubject($subject)
                : null,
        );
    }
}
