<?php

declare(strict_types=1);

namespace Cms\Licensing\Database\Factories;

use Cms\Licensing\Domain\Models\Plan;
use Cms\Licensing\Domain\Models\PlanFeature;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PlanFeature> */
final class PlanFeatureFactory extends Factory
{
    protected $model = PlanFeature::class;

    public function definition(): array
    {
        return [
            'project_id' => 'proj-1',
            'plan_id' => Plan::factory(),
            'organization_id' => null,
            'code' => fake()->unique()->slug(2),
            'name' => fake()->words(2, true),
        ];
    }
}
