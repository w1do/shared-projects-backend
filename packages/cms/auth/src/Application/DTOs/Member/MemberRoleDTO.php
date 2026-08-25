<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Member;

use Spatie\LaravelData\Data;

/**
 * Результат назначения роли участнику: панель показывает роль сразу после ответа.
 * Форма — `{id, role}`, а не полный `MemberDTO`: так отвечали и приглашение,
 * и смена роли.
 */
final class MemberRoleDTO extends Data
{
    public function __construct(
        public int $id,
        public string $role,
    ) {}
}
