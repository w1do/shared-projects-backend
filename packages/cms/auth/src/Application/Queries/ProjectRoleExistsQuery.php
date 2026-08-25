<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Domain\Models\Project;
use Spatie\Permission\Models\Role;

/** Объявлена ли роль с таким именем в этом проекте. */
final class ProjectRoleExistsQuery
{
    public function handle(Project $project, string $role): bool
    {
        return Role::query()
            ->where('project_id', $project->id)
            ->where('name', $role)
            ->exists();
    }
}
