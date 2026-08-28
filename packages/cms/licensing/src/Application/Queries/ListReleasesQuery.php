<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Domain\Models\Release;
use Illuminate\Contracts\Pagination\CursorPaginator;

/** Каталог релизов проекта: новые сверху. */
final class ListReleasesQuery
{
    public function handle(int $perPage = 50): CursorPaginator
    {
        return Release::query()
            ->orderByDesc('released_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage)
            ->withQueryString();
    }
}
