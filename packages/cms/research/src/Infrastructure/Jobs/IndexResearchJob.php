<?php

declare(strict_types=1);

namespace Cms\Research\Infrastructure\Jobs;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\Embed\EmbedRequestDTO;
use Cms\Research\Domain\Contracts\KnowledgeBase;
use Cms\Research\Domain\Enums\ResearchStatus;
use Cms\Research\Domain\Models\Research;
use Cms\Research\Domain\Models\ResearchSource;
use Cms\Research\Domain\ValueObjects\KnowledgePoint;
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
 * Запись материалов завершённого исследования в базу знаний проекта.
 *
 * Отдельная задача: недоступность хранилища не отменяет результат исследования,
 * а повторяется по неотмеченным источникам (`indexed_at is null`) и не создаёт
 * дубликатов — идентификатор точки детерминирован.
 */
final class IndexResearchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;

    /** @var list<int> */
    public array $backoff = [10, 60, 300, 900];

    public int $timeout = 300;

    public function __construct(
        public readonly string $projectId,
        public readonly int $researchId,
        public readonly ?int $taskId = null,
    ) {}

    public function handle(
        ProjectContext $context,
        KnowledgeBase $knowledge,
        AiOperations $ai,
        TaskProgress $progress,
    ): void {
        // Синхронная диспетчеризация выполняет джобу внутри чужого контекста:
        // прежнее значение возвращается, иначе вложенный запуск обнулил бы
        // проект вызывающего.
        $previous = $context->id();
        $context->set($this->projectId);

        try {
            $research = Research::query()->whereKey($this->researchId)->first();

            // Неуспешное и отменённое исследование в базу знаний не попадает.
            if ($research === null || $research->status !== ResearchStatus::Done) {
                return;
            }

            $this->report($progress, fn (int $taskId) => $progress->start($taskId, 'embedding'));

            $sources = $research->sources()->whereNull('indexed_at')->orderBy('position')->get();

            if ($sources->isEmpty()) {
                $this->markIndexed($research);
                $this->report($progress, fn (int $taskId) => $progress->succeed($taskId));

                return;
            }

            $vectors = $ai->embed(new EmbedRequestDTO(
                texts: $sources->map(static fn (ResearchSource $source): string => $source->content)->values()->all(),
            ))->vectors;

            $points = [];

            foreach ($sources->values() as $index => $source) {
                $points[] = new KnowledgePoint(
                    topic: $source->title ?? $research->query,
                    query: $research->query,
                    content: $source->content,
                    category: $this->category($research),
                    createdAt: ($research->completed_at ?? $research->freshTimestamp())->toIso8601String(),
                    vector: $vectors[$index] ?? [],
                    researchId: (int) $research->getKey(),
                    sourceId: (int) $source->getKey(),
                    sourceUrl: $source->url,
                    sourceTitle: $source->title,
                );
            }

            $this->report($progress, fn (int $taskId) => $progress->stage($taskId, 'saving'));
            $knowledge->upsert($this->projectId, $points);

            $research->sources()->whereIn('id', $sources->modelKeys())->update(['indexed_at' => now()]);

            $this->markIndexed($research);
            $this->report($progress, fn (int $taskId) => $progress->succeed($taskId));
        } finally {
            $previous === null ? $context->clear() : $context->set($previous);
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('research indexing failed', [
            'project' => $this->projectId,
            'research' => $this->researchId,
            'error' => $exception?->getMessage(),
        ]);

        if ($this->taskId !== null && $exception !== null) {
            app(TaskProgress::class)->fail($this->taskId, $exception);
        }
    }

    /** Ход пишется, только когда индексацию запустила задача реестра. */
    private function report(TaskProgress $progress, callable $write): void
    {
        if ($this->taskId !== null) {
            $write($this->taskId);
        }
    }

    /**
     * Категория записи обязательна. Своей категории у исследования нет, поэтому
     * ею служит исходный запрос — он же остаётся отбором в поиске.
     */
    private function category(Research $research): string
    {
        return $research->query;
    }

    private function markIndexed(Research $research): void
    {
        $research->forceFill(['indexed_at' => $research->freshTimestamp()])->save();
    }
}
