<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

use Cms\Pay\Domain\Models\Plan;

final readonly class ArchivePlanCommand
{
    public function __construct(public Plan $plan) {}
}
