<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Domain\Models\License;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * Лицензии проекта: фильтры `?filter[organization_id]=` и
 * `?filter[status]=active|revoked` (статус — условие на `revoked_at`, Д2),
 * счётчик активных установок для колонки «занято из лимита».
 */
final class ListLicensesQuery
{
    public function handle(int $perPage = 50): CursorPaginator
    {
        return QueryBuilder::for(
            License::query()->with(['organization', 'plan'])->withCount('activeInstallations'),
        )
            ->allowedFilters([
                AllowedFilter::exact('organization_id'),
                AllowedFilter::callback('status', function (Builder $query, mixed $value): void {
                    match ($value) {
                        'revoked' => $query->whereNotNull('revoked_at'),
                        'active' => $query->whereNull('revoked_at'),
                        default => $query,
                    };
                }),
            ])
            ->orderByDesc('issued_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage)
            ->withQueryString();
    }
}
