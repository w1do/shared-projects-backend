<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

use Cms\Pay\Domain\Enums\SubscriptionAction;
use Cms\Pay\Domain\Models\Subscription;

final readonly class ChangeSubscriptionCommand
{
    public function __construct(
        public Subscription $subscription,
        public SubscriptionAction $action,
    ) {}
}
