<?php

declare(strict_types=1);

namespace Cms\Shared\BackgroundTasks;

/** Состояние фоновой задачи проекта: от постановки в очередь до конечного исхода. */
enum BackgroundTaskState: string
{
    case Queued = 'queued';
    case Running = 'running';
    case Succeeded = 'succeeded';
    case Failed = 'failed';

    public function isFinal(): bool
    {
        return $this === self::Succeeded || $this === self::Failed;
    }

    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::Queued => $target !== self::Queued,
            // Повторная попытка после временной ошибки возвращает задачу в работу.
            self::Running => $target !== self::Queued,
            self::Succeeded, self::Failed => false,
        };
    }
}
