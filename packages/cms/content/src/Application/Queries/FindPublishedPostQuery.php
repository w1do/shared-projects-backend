<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Domain\Models\Post;

final class FindPublishedPostQuery
{
    /** Неопубликованный или чужой пост даёт 404, а не 403 (Safety Protocol, И11). */
    public function handle(string $slug, ?string $locale = null): Post
    {
        return Post::query()
            ->published()
            ->where('slug', $slug)
            ->when($locale, fn ($q) => $q->where('locale', $locale))
            ->with(['categories:id', 'seo'])
            ->firstOrFail();
    }
}
