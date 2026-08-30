<?php

declare(strict_types=1);

namespace Cms\Research\Infrastructure\Jobs;

use Cms\Research\Application\Commands\RebuildPostCommand;
use Cms\Research\Application\Handlers\RebuildPostHandler;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/** Пересборка текста существующего поста через AI. */
final class RebuildPostJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [10, 30, 120];

    public int $timeout = 300;

    public function __construct(
        public readonly string $projectId,
        public readonly int $postId,
        public readonly ?string $authorId = null,
        public readonly ?int $taskId = null,
    ) {}

    public function handle(
        ProjectContext $context,
        RebuildPostHandler $handler,
        TaskProgress $progress,
    ): void {
        // Синхронная диспетчеризация выполняет джобу внутри чужого контекста:
        // прежнее значение возвращается, иначе вложенный запуск обнулил бы
        // проект вызывающего.
        $previous = $context->id();
        $context->set($this->projectId);

        try {
            if ($this->taskId !== null) {
                $progress->start($this->taskId, 'preparing');
            }

            $handler->handle(new RebuildPostCommand($this->postId, $this->authorId, $this->taskId));

            if ($this->taskId !== null) {
                $progress->succeed($this->taskId);
            }
        } finally {
            $previous === null ? $context->clear() : $context->set($previous);
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('post rebuild failed', [
            'project' => $this->projectId,
            'post' => $this->postId,
            'error' => $exception?->getMessage(),
        ]);

        if ($this->taskId !== null && $exception !== null) {
            app(TaskProgress::class)->fail($this->taskId, $exception);
        }
    }
}
