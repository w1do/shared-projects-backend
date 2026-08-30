<?php

declare(strict_types=1);

namespace Cms\Shared\BackgroundTasks;

use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Реализация порта поверх таблицы `background_tasks`.
 *
 * Переход, запрещённый состоянием, тихо игнорируется: повторная доставка
 * задачи не должна ронять обработчик и переписывать конечный исход.
 */
final class EloquentTaskProgress implements TaskProgress
{
    public function queue(
        BackgroundTaskKind $kind,
        ?string $subjectType = null,
        ?string $subjectId = null,
        ?string $initiatedBy = null,
    ): int {
        $task = BackgroundTask::query()->create([
            'kind' => $kind,
            'state' => BackgroundTaskState::Queued,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'initiated_by' => $initiatedBy,
            'queued_at' => now(),
        ]);

        return (int) $task->id;
    }

    public function start(int $taskId, ?string $stage = null): void
    {
        $this->transition($taskId, BackgroundTaskState::Running, function (BackgroundTask $task) use ($stage): void {
            $task->started_at ??= now();
            if ($stage !== null) {
                $task->stage = $stage;
            }
        });
    }

    public function stage(int $taskId, string $stage): void
    {
        $task = $this->find($taskId);
        if ($task === null || $task->state->isFinal()) {
            return;
        }

        $task->stage = $stage;
        $task->save();
    }

    public function succeed(int $taskId): void
    {
        $this->transition($taskId, BackgroundTaskState::Succeeded, function (BackgroundTask $task): void {
            $task->finished_at = now();
        });
    }

    public function fail(int $taskId, Throwable $error): void
    {
        Log::error('Фоновая задача отклонена', [
            'task_id' => $taskId,
            'exception' => $error::class,
            'message' => $error->getMessage(),
        ]);

        $this->transition($taskId, BackgroundTaskState::Failed, function (BackgroundTask $task) use ($error): void {
            $task->finished_at = now();
            $task->failure_reason = FailureReason::of($error);
        });
    }

    private function transition(int $taskId, BackgroundTaskState $target, callable $apply): void
    {
        $task = $this->find($taskId);
        if ($task === null || ! $task->state->canTransitionTo($target)) {
            return;
        }

        $task->state = $target;
        $apply($task);
        $task->save();
    }

    private function find(int $taskId): ?BackgroundTask
    {
        // Без scope'а проекта: `failed()` обработчика вызывается вне контекста проекта.
        return BackgroundTask::acrossProjects()->find($taskId);
    }
}
