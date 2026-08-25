<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

use Cms\Pay\Domain\Models\Subscription;

/** action: cancel | resume | pause | delete */
final readonly class ChangeSubscriptionCommand
{
    public function __construct(
        public Subscription $subscription,
        public string $action,
    ) {}
}
