<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\City\RegionDTO;
use Cms\Content\Domain\Models\Region;

/** Регионы справочника для отбора городов в консоли. */
final class ListRegionsQuery
{
    /** @return list<RegionDTO> */
    public function handle(): array
    {
        return array_values(
            Region::query()
                ->orderBy('name')
                ->get()
                ->map(RegionDTO::fromModel(...))
                ->all(),
        );
    }
}
