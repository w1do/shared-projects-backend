<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Domain\Models\Page;

final class FindPublishedPage
{
    public function handle(string $slug): ?Page
    {
        return Page::query()->published()->where('slug', $slug)->with('seo')->first();
    }
}
