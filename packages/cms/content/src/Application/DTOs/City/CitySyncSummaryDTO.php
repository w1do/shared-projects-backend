<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\City;

use Spatie\LaravelData\Data;

/** Сводка прогона синхронизации справочника. */
final class CitySyncSummaryDTO extends Data
{
    /** @param  list<string>  $missing города справочника, которых нет в источнике */
    public function __construct(
        public int $regions_added,
        public int $regions_updated,
        public int $cities_added,
        public int $cities_updated,
        public array $missing,
    ) {}
}
