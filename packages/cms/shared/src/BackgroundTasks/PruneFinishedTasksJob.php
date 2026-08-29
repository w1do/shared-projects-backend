<?php

declare(strict_types=1);

namespace Cms\Shared\BackgroundTasks;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;

/**
 * Чистка реестра: завершённые задачи живут ровно столько, сколько их показывает
 * консоль. Без неё таблица растёт бесконечно, а индикатор превращается в архив.
 */
final class PruneFinishedTasksJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue;

    public function handle(): void
    {
        BackgroundTask::acrossProjects()
            ->whereNotNull('finished_at')
            ->where('finished_at', '<', BackgroundTaskWindow::since())
            ->delete();
    }
}
