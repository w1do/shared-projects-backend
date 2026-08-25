<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Application\DTOs\Member\MemberDTO;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Illuminate\Support\Collection;

final class ListMembers
{
    /** @return Collection<int, MemberDTO> */
    public function handle(Project $project): Collection
    {
        return $project->members()->get()->map(fn (Admin $admin) => new MemberDTO(
            id: $admin->id,
            name: $admin->name,
            email: $admin->email,
            roles: array_values(array_map('strval', $admin->roles()->wherePivot('project_id', $project->id)->pluck('name')->all())),
        ));
    }
}
