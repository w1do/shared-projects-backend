<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Task;

use Cms\Shared\BackgroundTasks\BackgroundTask;
use Spatie\LaravelData\Data;

/** Фоновая задача проекта в admin-ответах. */
final class BackgroundTaskDTO extends Data
{
    public function __construct(
        public int $id,
        public string $kind,
        public string $state,
        public ?string $stage,
        public ?string $subject_type,
        public ?string $subject_id,
        public ?string $failure_reason,
        public ?string $queued_at,
        public ?string $started_at,
        public ?string $finished_at,
    ) {}

    public static function fromModel(BackgroundTask $task): self
    {
        return new self(
            id: (int) $task->id,
            kind: $task->kind->value,
            state: $task->state->value,
            stage: $task->stage,
            subject_type: $task->subject_type,
            subject_id: $task->subject_id,
            failure_reason: $task->failure_reason,
            queued_at: $task->queued_at?->toIso8601String(),
            started_at: $task->started_at?->toIso8601String(),
            finished_at: $task->finished_at?->toIso8601String(),
        );
    }
}
