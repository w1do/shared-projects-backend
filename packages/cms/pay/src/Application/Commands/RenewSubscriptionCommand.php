<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

use Cms\Pay\Domain\Models\Subscription;

final readonly class RenewSubscriptionCommand
{
    public function __construct(public Subscription $subscription) {}
}
