<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\City;

use Cms\Content\Domain\Models\Region;
use Spatie\LaravelData\Data;

/** Регион справочника. */
final class RegionDTO extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $federal_district,
    ) {}

    public static function fromModel(Region $region): self
    {
        return new self(
            id: (int) $region->id,
            name: $region->name,
            federal_district: $region->federal_district,
        );
    }
}
