<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Domain\Models\Page;

final class FindPublishedPageQuery
{
    /** Неопубликованная или чужая страница даёт 404, а не 403 (Safety Protocol, И11). */
    public function handle(string $slug): Page
    {
        return Page::query()->published()->where('slug', $slug)->with('seo')->firstOrFail();
    }
}
