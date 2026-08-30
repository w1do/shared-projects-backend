<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Domain\Enums\SeoableType;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\City;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Носитель SEO по паре `{type}/{id}`.
 *
 * Неизвестный тип и отсутствующая запись дают ОДИН и тот же ответ 404
 * (снимки `seo-update-404`, `seo-update-404-unknown-type`, `seo-show-404`):
 * `ModelNotFoundException` рендерится тем же телом, что и `ErrorEnvelope::notFound()`
 * (доказано `NotFoundParityTest`, задача 1.4).
 */
final class FindSeoableQuery
{
    public function handle(string $type, int $id): Post|Page|Category|City
    {
        $seoable = SeoableType::tryFrom($type);

        if ($seoable === null) {
            throw new ModelNotFoundException;
        }

        $class = $seoable->modelClass();

        // seo грузится сразу: ленивая подгрузка в контроллере ушла (задача 5.3)
        return $class::query()->with('seo')->findOrFail($id);
    }
}
