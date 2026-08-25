<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Illuminate\Support\Collection;

final class ListProjectsQuery
{
    /** @return Collection<int, Project> */
    public function handle(Admin $admin): Collection
    {
        $query = Project::query()->orderBy('created_at');

        if (! $admin->isSuperAdmin()) {
            $query->whereHas('members', fn ($q) => $q->whereKey($admin->id));
        }

        return $query->get();
    }
}
