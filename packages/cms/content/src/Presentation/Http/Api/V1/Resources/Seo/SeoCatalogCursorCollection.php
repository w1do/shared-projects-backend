<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Resources\Seo;

use Cms\Shared\Http\Resources\ApiCursorCollection;

/** Курсорный каталог SEO: `{data, meta{per_page,next_cursor,prev_cursor}}`. */
final class SeoCatalogCursorCollection extends ApiCursorCollection
{
    public $collects = SeoCatalogItemResource::class;
}
