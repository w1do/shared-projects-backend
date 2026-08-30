<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\City;

use Spatie\LaravelData\Data;

/** Итог массового действия над составом городов проекта. */
final class CityBulkResultDTO extends Data
{
    public function __construct(public int $enabled) {}
}
