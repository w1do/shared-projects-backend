<?php

declare(strict_types=1);

namespace Cms\Content\Database\Factories;

use Cms\Content\Domain\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Post> */
final class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(4);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'body' => fake()->paragraphs(2, true),
            'locale' => 'ru',
        ];
    }
}
