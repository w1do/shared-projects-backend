<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Research\Application\Commands\AdaptCitySeoCommand;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Domain\Models\ProjectBuildout;
use Cms\Research\Infrastructure\Jobs\AdaptCitySeoJob;
use Cms\Shared\BackgroundTasks\BackgroundTask;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Contracts\Config\Repository as Config;

/**
 * Постановка адаптации SEO городов в очередь: одна задача на проект,
 * тематика берётся из проекта и переопределяется оператором.
 */
final readonly class StartCitySeoAdaptationHandler
{
    public function __construct(
        private ProjectContext $context,
        private Config $config,
        private Dispatcher $bus,
        private TaskProgress $progress,
    ) {}

    public function handle(AdaptCitySeoCommand $command): BackgroundTask
    {
        $projectId = $this->context->required();
        $topic = $this->topic($command->topic);

        if ($this->alreadyRunning()) {
            throw ResearchRuleViolation::citySeoAdaptationAlreadyRunning();
        }

        $taskId = $this->progress->queue(
            BackgroundTaskKind::CitySeoAdaptation,
            'project',
            $projectId,
            $command->authorId,
        );

        $this->bus->dispatch(
            (new AdaptCitySeoJob($projectId, $topic, $taskId))
                ->onQueue((string) $this->config->get('cms-research.queue', 'research')),
        );

        return BackgroundTask::query()->findOrFail($taskId);
    }

    /** Тематика запуска: переопределение оператора, иначе тематика проекта. */
    private function topic(?string $override): string
    {
        $topic = trim($override ?? (string) ProjectBuildout::query()->orderByDesc('id')->value('topic'));

        return $topic !== '' ? $topic : throw ResearchRuleViolation::projectTopicMissing();
    }

    private function alreadyRunning(): bool
    {
        return BackgroundTask::query()
            ->where('kind', BackgroundTaskKind::CitySeoAdaptation)
            ->active()
            ->exists();
    }
}
