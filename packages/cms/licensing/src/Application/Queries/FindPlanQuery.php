<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Domain\Models\Plan;

/**
 * План проекта по id с фичами. Tenant-изоляция — глобальным скоупом
 * `BelongsToProject`: чужой план не находится и даёт 404.
 */
final class FindPlanQuery
{
    public function handle(int $planId): Plan
    {
        return Plan::query()->with('features')->findOrFail($planId);
    }
}
