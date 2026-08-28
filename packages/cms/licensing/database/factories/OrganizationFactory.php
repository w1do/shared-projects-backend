<?php

declare(strict_types=1);

namespace Cms\Licensing\Database\Factories;

use Cms\Licensing\Domain\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Organization> */
final class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    public function definition(): array
    {
        return [
            'project_id' => 'proj-1',
            'name' => fake()->company(),
            'contact_first_name' => fake()->firstName(),
            'contact_last_name' => fake()->lastName(),
            'email' => fake()->unique()->companyEmail(),
        ];
    }
}
