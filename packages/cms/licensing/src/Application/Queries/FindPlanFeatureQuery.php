<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Domain\Models\Plan;
use Cms\Licensing\Domain\Models\PlanFeature;

/** Фича конкретного плана: чужая или несуществующая даёт 404. */
final class FindPlanFeatureQuery
{
    public function handle(Plan $plan, int $featureId): PlanFeature
    {
        return $plan->features()->findOrFail($featureId);
    }
}
