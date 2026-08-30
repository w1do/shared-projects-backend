<?php

declare(strict_types=1);

namespace Cms\Research\Infrastructure\Jobs;

use Cms\Research\Application\Commands\RebuildSeoCommand;
use Cms\Research\Application\Handlers\RebuildSeoHandler;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Пересборка SEO-полей проекта через AI.
 *
 * Без повторных попыток: пересборка каталога стоит запросов к модели, и
 * повторный запуск остаётся решением оператора, а не очереди.
 */
final class RebuildSeoJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 900;

    /** @param  list<array{type: string, id: int}>  $entities  пустой список — все сущности проекта */
    public function __construct(
        public readonly string $projectId,
        public readonly array $entities = [],
        public readonly ?int $taskId = null,
    ) {}

    public function handle(
        ProjectContext $context,
        RebuildSeoHandler $handler,
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

            $result = $handler->handle(new RebuildSeoCommand($this->entities, taskId: $this->taskId));

            if ($result->nothingProcessed() && $result->lastError !== null) {
                throw $result->lastError;
            }

            if ($this->taskId === null) {
                return;
            }

            $result->hasFailures() && $result->lastError !== null
                ? $progress->partial($this->taskId, $result->lastError)
                : $progress->succeed($this->taskId);
        } finally {
            $previous === null ? $context->clear() : $context->set($previous);
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('seo rebuild failed', [
            'project' => $this->projectId,
            'entities' => count($this->entities),
            'error' => $exception?->getMessage(),
        ]);

        if ($this->taskId !== null && $exception !== null) {
            app(TaskProgress::class)->fail($this->taskId, $exception);
        }
    }
}
