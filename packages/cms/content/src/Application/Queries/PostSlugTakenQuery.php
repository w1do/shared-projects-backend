<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Domain\Models\Post;

/**
 * Занят ли слаг поста внутри проекта и локали.
 *
 * Уникальность проверяется в пределах пары `(slug, locale)` текущего проекта
 * (глобальный scope модели), сам пост из проверки исключается.
 */
final class PostSlugTakenQuery
{
    public function handle(Post $post): bool
    {
        return Post::query()
            ->where('slug', $post->slug)
            ->where('locale', $post->locale)
            ->when($post->exists, fn ($q) => $q->whereKeyNot($post->getKey()))
            ->exists();
    }
}
