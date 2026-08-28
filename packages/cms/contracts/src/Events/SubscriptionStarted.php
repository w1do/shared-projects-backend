<?php

declare(strict_types=1);

namespace Cms\Contracts\Events;

/**
 * Межмодульное событие: оформлена новая подписка. Диспатчит pay,
 * слушает licensing — payload только скаляры, без моделей.
 * `periodEndsAt` — ISO 8601.
 */
final readonly class SubscriptionStarted
{
    public function __construct(
        public string $subscriptionId,
        public string $projectId,
        public string $subscriberType,
        public string $subscriberId,
        public string $subjectType,
        public string $subjectId,
        public string $periodEndsAt,
    ) {}
}
