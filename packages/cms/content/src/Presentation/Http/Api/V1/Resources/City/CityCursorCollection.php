<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Resources\City;

use Cms\Shared\Http\Resources\ApiCursorCollection;

/** Курсорный список городов: `{data, meta{per_page,next_cursor,prev_cursor}}`. */
final class CityCursorCollection extends ApiCursorCollection
{
    public $collects = CityResource::class;
}
