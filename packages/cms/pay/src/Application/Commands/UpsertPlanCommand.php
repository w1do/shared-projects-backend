<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

use Cms\Pay\Application\DTOs\Plan\UpsertPlanDTO;
use Cms\Pay\Domain\Models\Plan;

final readonly class UpsertPlanCommand
{
    public function __construct(
        public UpsertPlanDTO $data,
        public ?Plan $plan = null,
    ) {}
}
