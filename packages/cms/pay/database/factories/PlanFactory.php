<?php

declare(strict_types=1);

namespace Cms\Pay\Database\Factories;

use Cms\Pay\Domain\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Plan> */
final class PlanFactory extends Factory
{
    protected $model = Plan::class;

    public function definition(): array
    {
        return [
            'code' => fake()->unique()->slug(2),
            'name' => fake()->words(2, true),
            'price_minor' => fake()->numberBetween(9900, 99900),
            'currency' => 'RUB',
            'interval' => 'month',
        ];
    }
}
