<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Resources\Media;

use Cms\Shared\Http\Resources\ApiCursorCollection;

/** Курсорный список медиа: `{data, meta{per_page,next_cursor,prev_cursor}}`. */
final class MediaCursorCollection extends ApiCursorCollection
{
    public $collects = MediaResource::class;
}
