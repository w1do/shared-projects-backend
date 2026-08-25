<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Domain\Models\AuditLog;
use Cms\Auth\Domain\Models\Project;
use Illuminate\Contracts\Pagination\CursorPaginator;

final class ListAuditEntriesQuery
{
    public function handle(Project $project, int $perPage = 50): CursorPaginator
    {
        return AuditLog::query()
            ->where('project_id', $project->id)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage);
    }
}
