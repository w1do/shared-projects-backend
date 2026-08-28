<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\Release;

use Cms\Shared\Http\Resources\ApiCursorCollection;

/** Курсорная страница релизов: meta ровно per_page/next_cursor/prev_cursor (И5). */
final class ReleaseCursorCollection extends ApiCursorCollection
{
    public $collects = ReleaseCursorItemResource::class;
}
