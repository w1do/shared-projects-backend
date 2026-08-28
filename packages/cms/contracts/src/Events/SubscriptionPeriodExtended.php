<?php

declare(strict_types=1);

namespace Cms\Contracts\Events;

/**
 * Межмодульное событие: оплаченный период подписки продлён.
 * Диспатчит pay при успешной оплате продления, слушает licensing.
 * `periodEndsAt` — новый конец периода, ISO 8601.
 */
final readonly class SubscriptionPeriodExtended
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
