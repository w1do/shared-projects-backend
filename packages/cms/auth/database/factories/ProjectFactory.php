<?php

declare(strict_types=1);

namespace Cms\Auth\Database\Factories;

use Cms\Auth\Domain\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Project> */
final class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'key' => Str::slug(fake()->unique()->domainWord().'-'.fake()->randomNumber(3)),
            'name' => fake()->company(),
            'locales' => ['ru'],
        ];
    }
}
