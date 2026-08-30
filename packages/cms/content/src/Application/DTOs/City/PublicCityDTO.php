<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\City;

use Cms\Content\Application\DTOs\Seo\SeoDTO;
use Cms\Content\Domain\Models\City;
use Spatie\LaravelData\Data;

/** Включённый город проекта для публичного API: справочные поля и SEO-блок проекта. */
final class PublicCityDTO extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public string $region_name,
        public ?string $federal_district,
        public int $population,
        public ?string $latitude,
        public ?string $longitude,
        public ?SeoDTO $seo = null,
    ) {}

    public static function fromModel(City $city): self
    {
        return new self(
            id: (int) $city->id,
            name: $city->name,
            slug: $city->slug,
            region_name: $city->region->name,
            federal_district: $city->region->federal_district,
            population: $city->population,
            latitude: $city->latitude,
            longitude: $city->longitude,
            seo: $city->seo === null ? null : SeoDTO::fromModel($city->seo),
        );
    }
}
