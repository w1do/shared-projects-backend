<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\City\CityDTO;
use Cms\Content\Domain\Models\City;
use Illuminate\Contracts\Database\Eloquent\Builder;

/** Один город справочника с состоянием текущего проекта. */
final class FindProjectCityQuery
{
    public function handle(int $cityId): CityDTO
    {
        /** @var City $city */
        $city = City::query()
            ->with('region')
            ->withExists([
                'enrollments as enabled' => fn (Builder $q) => $q->where('enabled', true),
                'seo as has_seo',
            ])
            ->findOrFail($cityId);

        return CityDTO::fromModel($city);
    }
}
