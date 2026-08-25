<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Domain\Models\User;

/**
 * Пользователь сайта текущего проекта.
 *
 * Скоуп проекта — глобальный (`BelongsToProject` + `ProjectContext`), поэтому
 * чужой пользователь не находится и отдаётся 404 (И11).
 */
final class FindProjectUserQuery
{
    public function handle(int $userId): User
    {
        /** @var User $user */
        $user = User::query()->whereKey($userId)->firstOrFail();

        return $user;
    }
}
