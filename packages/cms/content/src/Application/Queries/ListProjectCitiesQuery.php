<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\City\CityDTO;
use Cms\Content\Application\DTOs\City\CityFilterDTO;
use Cms\Content\Domain\Models\City;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Pagination\CursorPaginator;

/**
 * Города справочника с состоянием текущего проекта: включённость и заполненность
 * SEO приезжают подзапросами, страница — общим курсорным механизмом.
 */
final class ListProjectCitiesQuery
{
    private const SORT_COLUMNS = ['population' => 'population', 'name' => 'name'];

    /** @return CursorPaginator<int, CityDTO> */
    public function handle(CityFilterDTO $filter): CursorPaginator
    {
        $query = City::query()
            ->with('region')
            ->withExists([
                'enrollments as enabled' => fn (Builder $q) => $q->where('enabled', true),
                'seo as has_seo',
            ]);

        if ($filter->search !== null && trim($filter->search) !== '') {
            $query->where('name', 'like', '%'.trim($filter->search).'%');
        }

        if ($filter->region_id !== null) {
            $query->where('region_id', $filter->region_id);
        }

        if ($filter->enabled !== null) {
            $filter->enabled
                ? $query->whereHas('enrollments', fn (Builder $q) => $q->where('enabled', true))
                : $query->whereDoesntHave('enrollments', fn (Builder $q) => $q->where('enabled', true));
        }

        $column = self::SORT_COLUMNS[$filter->sort] ?? 'population';
        $direction = $filter->direction === 'asc' ? 'asc' : 'desc';

        /** @var CursorPaginator<int, City> $page */
        $page = $query->orderBy($column, $direction)->orderBy('id')->cursorPaginate($filter->per_page);

        return $page->through(CityDTO::fromModel(...));
    }
}
