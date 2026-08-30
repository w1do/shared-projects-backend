<?php

declare(strict_types=1);

namespace Cms\Research\Infrastructure\Jobs;

use Cms\Research\Application\Commands\GeneratePostCommand;
use Cms\Research\Application\Handlers\GeneratePostFromTopicHandler;
use Cms\Research\Domain\Enums\TopicStatus;
use Cms\Research\Domain\Models\ResearchTopic;
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
 * Написание поста по теме.
 *
 * Повторная доставка не создаёт второго поста: тема, переведённая в
 * «использована», из работы выходит.
 */
final class GeneratePostJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [10, 30, 120];

    public int $timeout = 300;

    public function __construct(
        public readonly string $projectId,
        public readonly int $topicId,
        public readonly ?string $authorId = null,
        public readonly ?int $taskId = null,
    ) {}

    public function handle(
        ProjectContext $context,
        GeneratePostFromTopicHandler $handler,
        TaskProgress $progress,
    ): void {
        // Синхронная диспетчеризация выполняет джобу внутри чужого контекста:
        // прежнее значение возвращается, иначе вложенный запуск обнулил бы
        // проект вызывающего.
        $previous = $context->id();
        $context->set($this->projectId);

        try {
            $status = ResearchTopic::query()->whereKey($this->topicId)->value('status');

            if ($status === null || $status === TopicStatus::Used->value || $status === TopicStatus::Used) {
                return;
            }

            if ($this->taskId !== null) {
                $progress->start($this->taskId, 'preparing');
            }

            $post = $handler->handle(new GeneratePostCommand($this->topicId, $this->authorId, $this->taskId));

            if ($this->taskId !== null) {
                $progress->succeed($this->taskId);
            }
        } finally {
            $previous === null ? $context->clear() : $context->set($previous);
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('post generation failed', [
            'project' => $this->projectId,
            'topic' => $this->topicId,
            'error' => $exception?->getMessage(),
        ]);

        if ($this->taskId !== null && $exception !== null) {
            app(TaskProgress::class)->fail($this->taskId, $exception);
        }
    }
}
