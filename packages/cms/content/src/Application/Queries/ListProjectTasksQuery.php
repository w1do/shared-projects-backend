<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\Task\BackgroundTaskDTO;
use Cms\Content\Application\DTOs\Task\TaskFilterDTO;
use Cms\Shared\BackgroundTasks\BackgroundTask;
use Cms\Shared\BackgroundTasks\BackgroundTaskState;
use Cms\Shared\BackgroundTasks\BackgroundTaskWindow;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

final class ListProjectTasksQuery
{
    /**
     * Фоновые задачи проекта: сначала выполняющиеся, затем недавно завершённые.
     *
     * @return Collection<int, BackgroundTaskDTO>
     */
    public function handle(TaskFilterDTO $filter): Collection
    {
        $since = BackgroundTaskWindow::since();

        return BackgroundTask::query()
            ->where(fn (Builder $query) => $query
                ->whereIn('state', [BackgroundTaskState::Queued, BackgroundTaskState::Running])
                ->orWhere(fn (Builder $finished) => $finished
                    ->whereNotNull('finished_at')
                    ->where('finished_at', '>=', $since)))
            ->when($filter->kind, fn (Builder $query, string $kind) => $query->where('kind', $kind))
            ->when($filter->subject_type, fn (Builder $query, string $type) => $query->where('subject_type', $type))
            ->when($filter->subject_id, fn (Builder $query, string $id) => $query->where('subject_id', $id))
            // Выполняющиеся идут первыми: индикатор в панели показывает работу, а не архив.
            ->orderByRaw('case when finished_at is null then 0 else 1 end')
            ->orderByDesc('id')
            ->get()
            ->map(BackgroundTaskDTO::fromModel(...))
            ->values();
    }
}
