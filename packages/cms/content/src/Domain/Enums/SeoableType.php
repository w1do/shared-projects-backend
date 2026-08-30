<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Enums;

use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\City;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;

/**
 * Сущности, к которым крепится полиморфное SEO: сегмент `{type}` маршрута
 * `/content/seo/{type}/{id}`.
 */
enum SeoableType: string
{
    case Post = 'post';
    case Page = 'page';
    case Category = 'category';
    case City = 'city';

    /** @return class-string<Post|Page|Category|City> */
    public function modelClass(): string
    {
        return match ($this) {
            self::Post => Post::class,
            self::Page => Page::class,
            self::Category => Category::class,
            self::City => City::class,
        };
    }

    /**
     * Типы каталога SEO. Города в каталог не входят: их тысяча, и они правятся
     * в своём разделе с отбором по региону и включённости (Decision Д6).
     *
     * @return list<self>
     */
    public static function catalogTypes(): array
    {
        return [self::Post, self::Page, self::Category];
    }

    /** @return list<string> */
    public static function catalogValues(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::catalogTypes());
    }
}
