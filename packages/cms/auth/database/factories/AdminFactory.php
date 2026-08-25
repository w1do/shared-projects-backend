<?php

declare(strict_types=1);

namespace Cms\Auth\Database\Factories;

use Cms\Auth\Domain\Models\Admin;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Admin> */
final class AdminFactory extends Factory
{
    protected $model = Admin::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password',
            'locale' => 'ru',
        ];
    }
}
