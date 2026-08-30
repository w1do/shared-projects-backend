<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\City\PublicCityDTO;
use Cms\Content\Domain\Models\City;
use Illuminate\Contracts\Database\Eloquent\Builder;

/** Включённый город проекта по слагу; выключенный отвечает 404. */
final class FindPublicCityQuery
{
    public function handle(string $slug): PublicCityDTO
    {
        /** @var City $city */
        $city = City::query()
            ->with(['region', 'seo'])
            ->where('slug', $slug)
            ->whereHas('enrollments', fn (Builder $q) => $q->where('enabled', true))
            ->firstOrFail();

        return PublicCityDTO::fromModel($city);
    }
}
