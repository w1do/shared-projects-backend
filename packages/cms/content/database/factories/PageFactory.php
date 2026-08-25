<?php

declare(strict_types=1);

namespace Cms\Content\Database\Factories;

use Cms\Content\Domain\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Page> */
final class PageFactory extends Factory
{
    protected $model = Page::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);

        return ['title' => $title, 'slug' => Str::slug($title), 'body' => fake()->paragraph(), 'locale' => 'ru'];
    }
}
