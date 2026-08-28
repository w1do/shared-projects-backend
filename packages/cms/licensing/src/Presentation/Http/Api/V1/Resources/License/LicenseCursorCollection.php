<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\License;

use Cms\Shared\Http\Resources\ApiCursorCollection;

/** Курсорная страница лицензий: meta ровно per_page/next_cursor/prev_cursor (И5). */
final class LicenseCursorCollection extends ApiCursorCollection
{
    public $collects = LicenseCursorItemResource::class;
}
