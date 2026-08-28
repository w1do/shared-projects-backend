<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Domain\Models\Organization;
use Illuminate\Contracts\Pagination\CursorPaginator;

final class ListOrganizationsQuery
{
    public function handle(int $perPage = 50): CursorPaginator
    {
        return Organization::query()->orderByDesc('created_at')->orderByDesc('id')->cursorPaginate($perPage);
    }
}
