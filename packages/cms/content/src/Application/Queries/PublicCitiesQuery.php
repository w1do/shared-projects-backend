<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\City\PublicCityDTO;
use Cms\Content\Domain\Models\City;
use Illuminate\Contracts\Database\Eloquent\Builder;

/** Включённые города текущего проекта: выключенные в публичную выдачу не попадают. */
final class PublicCitiesQuery
{
    /** @return list<PublicCityDTO> */
    public function handle(): array
    {
        return array_values(
            City::query()
                ->with(['region', 'seo'])
                ->whereHas('enrollments', fn (Builder $q) => $q->where('enabled', true))
                ->orderByDesc('population')
                ->orderBy('id')
                ->get()
                ->map(PublicCityDTO::fromModel(...))
                ->all(),
        );
    }
}
