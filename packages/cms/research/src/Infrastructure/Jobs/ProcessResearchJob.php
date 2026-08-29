<?php

declare(strict_types=1);

namespace Cms\Research\Infrastructure\Jobs;

use Cms\Research\Application\Actions\SplitPromptIntoSubQueriesAction;
use Cms\Research\Application\Actions\SummarizeSourcesAction;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Domain\Contracts\PageContentFetcher;
use Cms\Research\Domain\Contracts\SerpSearchClient;
use Cms\Research\Domain\Enums\ResearchProgressStage;
use Cms\Research\Domain\Enums\ResearchStatus;
use Cms\Research\Domain\Exceptions\ResearchCanceled;
use Cms\Research\Domain\Models\Research;
use Cms\Research\Domain\Models\ResearchSource;
use Cms\Research\Domain\ValueObjects\PageContent;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Пайплайн исследования: подзапросы → поиск → загрузка страниц → сводный текст.
 *
 * Повторная доставка завершённой или отменённой задачи не откатывает состояние,
 * а отмена во время работы останавливает пайплайн на ближайшей границе этапа.
 */
final class ProcessResearchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [5, 15, 30];

    public int $timeout = 600;

    public function __construct(
        public readonly string $projectId,
        public readonly int $researchId,
        public readonly ?int $taskId = null,
    ) {}

    public function handle(
        ProjectContext $context,
        SplitPromptIntoSubQueriesAction $split,
        SerpSearchClient $search,
        PageContentFetcher $fetcher,
        SummarizeSourcesAction $summarize,
        Dispatcher $bus,
        TaskProgress $progress,
    ): void {
        // Синхронная диспетчеризация выполняет джобу внутри чужого контекста:
        // прежнее значение возвращается, иначе вложенный запуск обнулил бы
        // проект вызывающего.
        $previous = $context->id();
        $context->set($this->projectId);

        try {
            $research = Research::query()->whereKey($this->researchId)->first();

            // Повторная доставка не откатывает завершённое и не возобновляет отменённое.
            if ($research === null || $research->isFinished()) {
                return;
            }

            $this->progressStart($progress);
            $this->run($research, $split, $search, $fetcher, $summarize, $bus, $progress);
            $this->progressSucceed($progress);
        } catch (ResearchCanceled) {
            // Отмена — не отказ: состояние уже переведено оператором, задача тоже закрывается.
            $this->progressSucceed($progress);
        } finally {
            $previous === null ? $context->clear() : $context->set($previous);
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('research failed', [
            'project' => $this->projectId,
            'research' => $this->researchId,
            'error' => $exception?->getMessage(),
        ]);

        $research = Research::acrossProjects()->whereKey($this->researchId)->first();

        if ($research === null || ! $research->status->canTransitionTo(ResearchStatus::Failed)) {
            return;
        }

        $research->status = ResearchStatus::Failed;
        $research->error_message = $exception?->getMessage() ?? 'Research job failed.';
        $research->completed_at = $research->freshTimestamp();
        $research->save();

        if ($this->taskId !== null && $exception !== null) {
            app(TaskProgress::class)->fail($this->taskId, $exception);
        }
    }

    private function run(
        Research $research,
        SplitPromptIntoSubQueriesAction $split,
        SerpSearchClient $search,
        PageContentFetcher $fetcher,
        SummarizeSourcesAction $summarize,
        Dispatcher $bus,
        TaskProgress $progress,
    ): void {
        $research->forceFill([
            'status' => ResearchStatus::Process,
            'progress_stage' => ResearchProgressStage::Starting,
            'error_message' => null,
            'started_at' => $research->started_at ?? $research->freshTimestamp(),
        ])->save();

        $subQueries = $split->handle($research->query, $research->sub_queries_count);

        $this->advance($research, ResearchProgressStage::Searching, $progress, ['sub_queries' => $subQueries]);

        $sources = $this->collectSources($research, $subQueries, $search, $fetcher);

        if ($sources === []) {
            $research->forceFill([
                'status' => ResearchStatus::Failed,
                'error_message' => 'None of the found pages could be fetched.',
                'completed_at' => $research->freshTimestamp(),
            ])->save();

            if ($this->taskId !== null) {
                $progress->fail($this->taskId, ResearchRuleViolation::noSourcesFetched());
            }

            return;
        }

        $this->advance($research, ResearchProgressStage::Writing, $progress);

        $summary = $summarize->handle($research->query, $sources, $research->offer);

        $research->forceFill([
            'status' => ResearchStatus::Done,
            'progress_stage' => ResearchProgressStage::Completed,
            'summary' => $summary,
            'completed_at' => $research->freshTimestamp(),
        ])->save();

        // Индексация — отдельной задачей: недоступность базы знаний не отменяет
        // результат исследования и повторяется сама.
        $bus->dispatch(new IndexResearchJob(
            $this->projectId,
            (int) $research->getKey(),
            $progress->queue(BackgroundTaskKind::ResearchIndexing, 'research', (string) $research->getKey()),
        ));
    }

    /**
     * @param  list<string>  $subQueries
     * @return list<PageContent>
     */
    private function collectSources(
        Research $research,
        array $subQueries,
        SerpSearchClient $search,
        PageContentFetcher $fetcher,
    ): array {
        /** @var array<string, PageContent> $sources */
        $sources = [];
        $position = 0;

        foreach ($subQueries as $subQuery) {
            $this->assertNotCanceled($research);

            foreach ($search->search($subQuery, $research->engine, $research->results_per_sub_query) as $result) {
                if (isset($sources[$result->link])) {
                    continue;
                }

                // Недоступный источник пропускается: исследование завершается по остальным.
                $page = $fetcher->fetch($result->link);

                if ($page === null) {
                    continue;
                }

                $sources[$result->link] = $page;

                // Уникальность по (research_id, url_hash): повторная доставка
                // задачи не создаёт второй копии страницы.
                ResearchSource::firstOrCreate(
                    [
                        'research_id' => $research->getKey(),
                        'url_hash' => ResearchSource::hashUrl($page->link),
                    ],
                    [
                        'project_id' => $this->projectId,
                        'sub_query' => $subQuery,
                        'position' => $position++,
                        'url' => $page->link,
                        'title' => $page->title ?? $result->title,
                        'content' => $page->content,
                    ],
                );
            }
        }

        return array_values($sources);
    }

    /** @param array<string, mixed> $attributes */
    private function advance(
        Research $research,
        ResearchProgressStage $stage,
        TaskProgress $progress,
        array $attributes = [],
    ): void {
        $this->assertNotCanceled($research);

        $research->forceFill(array_merge($attributes, ['progress_stage' => $stage]))->save();

        if ($this->taskId !== null) {
            $progress->stage($this->taskId, $stage->value);
        }
    }

    private function progressStart(TaskProgress $progress): void
    {
        if ($this->taskId !== null) {
            $progress->start($this->taskId, ResearchProgressStage::Starting->value);
        }
    }

    /** Исследование ушло в конечное состояние — задача не может остаться «выполняется». */
    private function progressSucceed(TaskProgress $progress): void
    {
        if ($this->taskId !== null) {
            $progress->succeed($this->taskId);
        }
    }

    private function assertNotCanceled(Research $research): void
    {
        $status = Research::query()->whereKey($research->getKey())->value('status');

        if ($status === ResearchStatus::Canceled->value || $status === ResearchStatus::Canceled) {
            throw new ResearchCanceled;
        }
    }
}
