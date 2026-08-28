<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Domain\Models\License;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * Лицензии проекта: фильтры по организации и вычисляемому статусу
 * (`?filter[organization_id]=`, `?filter[status]=active|expired|revoked`)
 * через laravel-query-builder; статус выражается условиями на фактах (Д5).
 */
final class ListLicensesQuery
{
    public function handle(int $perPage = 50): CursorPaginator
    {
        return QueryBuilder::for(License::query()->with(['organization', 'plan']))
            ->allowedFilters([
                AllowedFilter::exact('organization_id'),
                AllowedFilter::callback('status', function (Builder $query, mixed $value): void {
                    match ($value) {
                        'revoked' => $query->whereNotNull('revoked_at'),
                        'expired' => $query->whereNull('revoked_at')->where('expires_at', '<=', now()),
                        'active' => $query->whereNull('revoked_at')->where('expires_at', '>', now()),
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
