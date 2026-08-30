<?php

declare(strict_types=1);

namespace Cms\Content\Domain\ValueObjects;

/** Запись источника справочника: город с его регионом, уже приведённый к полям платформы. */
final readonly class CityRecord
{
    public function __construct(
        public string $regionName,
        public ?string $federalDistrict,
        public string $name,
        public ?string $slug,
        public int $population,
        public ?float $latitude,
        public ?float $longitude,
    ) {}
}
