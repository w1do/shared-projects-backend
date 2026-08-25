<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Enums;

use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;

/**
 * Сущности, к которым крепится полиморфное SEO: сегмент `{type}` маршрута
 * `/content/seo/{type}/{id}`. Множество значений прежнее — post|page|category
 * (Safety Protocol, И2: контракт границы не расширяется).
 */
enum SeoableType: string
{
    case Post = 'post';
    case Page = 'page';
    case Category = 'category';

    /** @return class-string<Post|Page|Category> */
    public function modelClass(): string
    {
        return match ($this) {
            self::Post => Post::class,
            self::Page => Page::class,
            self::Category => Category::class,
        };
    }
}
