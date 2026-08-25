<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Domain\Models\User;
use Cms\Shared\Tenant\ProjectContext;

/**
 * Пользователь сайта текущего проекта.
 *
 * Скоуп проекта продублирован явно (защита в глубину, Д5): глобальный
 * `BelongsToProject` остаётся, но корректность 404 на чужого пользователя
 * больше не держится на одном невидимом механизме.
 */
final class FindProjectUserQuery
{
    public function __construct(private readonly ProjectContext $context) {}

    public function handle(int $userId): User
    {
        /** @var User $user */
        $user = User::query()
            ->where('project_id', $this->context->required())
            ->whereKey($userId)
            ->firstOrFail();

        return $user;
    }
}
