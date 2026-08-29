<?php

declare(strict_types=1);

namespace Cms\Shared\BackgroundTasks;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;

/**
 * Уборка реестра задач.
 *
 * Закрывает заброшенные: обработчик мог умереть, не дойдя ни до успеха, ни до
 * `failed()` — такая запись иначе висела бы «принята» вечно и держала индикатор.
 * Удаляет завершённые старше срока выдачи: без этого таблица растёт бесконечно,
 * а индикатор превращается в архив.
 */
final class TidyBackgroundTasksJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue;

    public function handle(): void
    {
        $this->closeAbandoned();
        $this->deleteOldFinished();
    }

    private function closeAbandoned(): void
    {
        BackgroundTask::acrossProjects()
            ->active()
            ->where('created_at', '<', BackgroundTaskWindow::abandonedSince())
            ->update([
                'state' => BackgroundTaskState::Failed,
                'failure_reason' => BackgroundTaskWindow::ABANDONED_REASON,
                'finished_at' => now(),
            ]);
    }

    private function deleteOldFinished(): void
    {
        BackgroundTask::acrossProjects()
            ->whereNotNull('finished_at')
            ->where('finished_at', '<', BackgroundTaskWindow::since())
            ->delete();
    }
}
