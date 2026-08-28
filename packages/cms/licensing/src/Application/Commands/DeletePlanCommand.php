<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Domain\Models\Plan;

final readonly class DeletePlanCommand
{
    public function __construct(public Plan $plan) {}
}
