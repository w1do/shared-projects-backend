<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Application\DTOs\Plan\UpsertPlanDTO;
use Cms\Licensing\Domain\Models\Plan;

final readonly class UpsertPlanCommand
{
    public function __construct(
        public UpsertPlanDTO $data,
        public ?Plan $plan = null,
    ) {}
}
