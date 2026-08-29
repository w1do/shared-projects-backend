<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Research\Application\Commands\StartResearchCommand;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Domain\Enums\ResearchProgressStage;
use Cms\Research\Domain\Enums\ResearchStatus;
use Cms\Research\Domain\Enums\SearchEngine;
use Cms\Research\Domain\Models\Research;
use Cms\Research\Infrastructure\Jobs\ProcessResearchJob;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Contracts\Config\Repository as Config;

final readonly class StartResearchHandler
{
    public function __construct(
        private ProjectContext $context,
        private Config $config,
        private Dispatcher $bus,
        private TaskProgress $progress,
    ) {}

    public function handle(StartResearchCommand $command): Research
    {
        $projectId = $this->context->required();

        $this->assertBelowConcurrencyLimit();

        $research = Research::create([
            'project_id' => $projectId,
            'query' => $command->data->query,
            'offer' => $command->data->offer,
            'engine' => $this->engine($command->data->engine),
            'sub_queries_count' => $command->data->subQueriesCount
                ?? (int) $this->config->get('cms-research.sub_queries_count', 4),
            'results_per_sub_query' => $command->data->resultsPerSubQuery
                ?? (int) $this->config->get('cms-research.results_per_sub_query', 5),
            'status' => ResearchStatus::Process,
            'progress_stage' => ResearchProgressStage::Starting,
            'author_id' => $command->authorId,
        ]);

        $taskId = $this->progress->queue(
            BackgroundTaskKind::Research,
            'research',
            (string) $research->getKey(),
            $command->authorId,
        );

        $this->bus->dispatch(
            (new ProcessResearchJob($projectId, (int) $research->getKey(), $taskId))
                ->onQueue((string) $this->config->get('cms-research.queue', 'research')),
        );

        return $research;
    }

    private function engine(?string $engine): SearchEngine
    {
        return SearchEngine::tryFrom((string) ($engine ?? $this->config->get('cms-research.engine', 'yandex')))
            ?? SearchEngine::Yandex;
    }

    /** Идущие исследования не прерываются: отклоняется только новый запуск. */
    private function assertBelowConcurrencyLimit(): void
    {
        $limit = (int) $this->config->get('cms-research.max_concurrent', 3);

        if ($limit > 0 && Research::query()->running()->count() >= $limit) {
            throw ResearchRuleViolation::tooManyRunning($limit);
        }
    }
}
