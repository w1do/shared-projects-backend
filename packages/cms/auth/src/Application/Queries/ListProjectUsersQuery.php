<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Domain\Models\User;
use Illuminate\Contracts\Pagination\CursorPaginator;

/** Пользователи текущего проекта (scope из ProjectContext). */
final class ListProjectUsersQuery
{
    public function handle(int $perPage = 50): CursorPaginator
    {
        return User::query()->orderByDesc('id')->cursorPaginate($perPage);
    }
}
