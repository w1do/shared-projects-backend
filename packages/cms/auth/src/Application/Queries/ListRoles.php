<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Application\DTOs\Role\RoleDTO;
use Cms\Auth\Domain\Models\Project;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Role;

final class ListRoles
{
    /** @return Collection<int, RoleDTO> */
    public function handle(Project $project): Collection
    {
        return Role::query()
            ->where('project_id', $project->id)
            ->with('permissions:id,name')
            ->get()
            ->map(RoleDTO::fromModel(...));
    }
}
