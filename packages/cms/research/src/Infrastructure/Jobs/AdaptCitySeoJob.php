<?php

declare(strict_types=1);

namespace Cms\Research\Infrastructure\Jobs;

use Cms\Research\Application\Commands\AdaptCitySeoCommand;
use Cms\Research\Application\Handlers\AdaptCitySeoHandler;
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
 * Адаптация SEO включённых городов проекта под его тематику.
 *
 * Без повторных попыток: прогон стоит вызова модели на каждый город, и
 * повторный запуск остаётся решением оператора, а не очереди.
 */
final class AdaptCitySeoJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 3600;

    public function __construct(
        public readonly string $projectId,
        public readonly string $topic,
        public readonly ?int $taskId = null,
    ) {}

    public function handle(
        ProjectContext $context,
        AdaptCitySeoHandler $handler,
        TaskProgress $progress,
    ): void {
        $previous = $context->id();
        $context->set($this->projectId);

        try {
            if ($this->taskId !== null) {
                $progress->start($this->taskId, 'preparing');
            }

            $result = $handler->handle(new AdaptCitySeoCommand($this->topic, taskId: $this->taskId));

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
        Log::error('city seo adaptation failed', [
            'project' => $this->projectId,
            'topic' => $this->topic,
            'error' => $exception?->getMessage(),
        ]);

        if ($this->taskId !== null && $exception !== null) {
            app(TaskProgress::class)->fail($this->taskId, $exception);
        }
    }
}
