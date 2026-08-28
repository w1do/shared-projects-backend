<?php

declare(strict_types=1);

namespace Cms\Licensing\Database\Factories;

use Cms\Licensing\Domain\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Plan> */
final class PlanFactory extends Factory
{
    protected $model = Plan::class;

    public function definition(): array
    {
        return [
            'project_id' => 'proj-1',
            'code' => fake()->unique()->slug(2),
            'name' => fake()->words(2, true),
        ];
    }

    /** План с ценой периода — предмет подписки. */
    public function priced(int $priceMinor = 99900, string $currency = 'RUB', string $interval = 'month'): self
    {
        return $this->state([
            'price_minor' => $priceMinor,
            'currency' => $currency,
            'interval' => $interval,
        ]);
    }
}
