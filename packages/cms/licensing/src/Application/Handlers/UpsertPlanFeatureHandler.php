<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\UpsertPlanFeatureCommand;
use Cms\Licensing\Application\Exceptions\PlanRuleViolation;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\PlanFeature;
use Spatie\LaravelData\Optional;

final class UpsertPlanFeatureHandler
{
    public function handle(UpsertPlanFeatureCommand $command): PlanFeature
    {
        $data = $command->data;
        $feature = $command->feature ?? new PlanFeature;

        $organizationId = $data->organization_id instanceof Optional
            ? $feature->organization_id
            : $data->organization_id;

        // Переопределение адресует организацию текущего проекта (tenant-изоляция)
        if ($organizationId !== null && ! Organization::query()->whereKey($organizationId)->exists()) {
            throw PlanRuleViolation::unknownOrganization();
        }

        // Уникальность plan + organization + code
        $duplicate = PlanFeature::query()
            ->where('plan_id', $command->plan->id)
            ->where('organization_id', $organizationId)
            ->where('code', $data->code)
            ->when($feature->exists, fn ($query) => $query->whereKeyNot($feature->getKey()))
            ->exists();
        if ($duplicate) {
            throw PlanRuleViolation::duplicateFeature();
        }

        $feature->plan_id = $command->plan->id;
        $feature->organization_id = $organizationId;
        $feature->code = $data->code;
        $feature->name = $data->name;
        $feature->save();

        return $feature;
    }
}
