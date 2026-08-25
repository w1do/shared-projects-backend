<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Resources\Post;

use Cms\Shared\Http\Resources\ApiCursorCollection;

/** Курсорный список постов: `{data, meta{per_page,next_cursor,prev_cursor}}`. */
final class PostCursorCollection extends ApiCursorCollection
{
    public $collects = PostResource::class;
}
