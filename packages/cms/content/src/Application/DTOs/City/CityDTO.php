<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\City;

use Cms\Content\Domain\Models\City;
use Spatie\LaravelData\Data;

/** Город справочника глазами проекта: справочные поля плюс включённость и заполненность SEO. */
final class CityDTO extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public int $region_id,
        public string $region_name,
        public ?string $federal_district,
        public int $population,
        public bool $enabled,
        public bool $has_seo,
    ) {}

    public static function fromModel(City $city): self
    {
        return new self(
            id: (int) $city->id,
            name: $city->name,
            slug: $city->slug,
            region_id: (int) $city->region_id,
            region_name: $city->region->name,
            federal_district: $city->region->federal_district,
            population: $city->population,
            enabled: (bool) $city->getAttribute('enabled'),
            has_seo: (bool) $city->getAttribute('has_seo'),
        );
    }
}
