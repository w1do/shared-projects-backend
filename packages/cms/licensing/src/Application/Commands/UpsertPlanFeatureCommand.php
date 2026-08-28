<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Application\DTOs\PlanFeature\UpsertPlanFeatureDTO;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Licensing\Domain\Models\PlanFeature;

final readonly class UpsertPlanFeatureCommand
{
    public function __construct(
        public Plan $plan,
        public UpsertPlanFeatureDTO $data,
        public ?PlanFeature $feature = null,
    ) {}
}
