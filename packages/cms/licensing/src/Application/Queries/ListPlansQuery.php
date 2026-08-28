<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Domain\Models\Plan;
use Illuminate\Contracts\Pagination\CursorPaginator;

final class ListPlansQuery
{
    public function handle(int $perPage = 50): CursorPaginator
    {
        return Plan::query()->with('features')->orderByDesc('created_at')->orderByDesc('id')->cursorPaginate($perPage);
    }
}
