<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Domain\Models\Project;
use Spatie\Permission\Models\Role;

/**
 * Роль проекта по идентификатору.
 *
 * Скоуп по `project_id` — часть поиска, а не отдельная проверка доступа (И11):
 * роль чужого проекта обязана быть неотличима от несуществующей (404, не 403).
 */
final class FindProjectRoleQuery
{
    public function handle(Project $project, int $roleId): Role
    {
        /** @var Role $role */
        $role = Role::query()
            ->where('project_id', $project->id)
            ->whereKey($roleId)
            ->firstOrFail();

        return $role;
    }
}
