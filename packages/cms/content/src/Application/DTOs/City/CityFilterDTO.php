<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\City;

use Spatie\LaravelData\Data;

/** Отбор городов проекта: поиск, регион, включённость, сортировка, размер страницы. */
final class CityFilterDTO extends Data
{
    public function __construct(
        public ?string $search = null,
        public ?int $region_id = null,
        public ?bool $enabled = null,
        public string $sort = 'population',
        public string $direction = 'desc',
        public int $per_page = 25,
    ) {}
}
