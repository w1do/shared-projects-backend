<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Research\Application\Commands\RebuildSeoCommand;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Infrastructure\Jobs\RebuildSeoJob;
use Cms\Shared\BackgroundTasks\BackgroundTask;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Contracts\Config\Repository as Config;

/** Постановка пересборки SEO в очередь: проект пересобирается по одной задаче за раз. */
final readonly class StartSeoRebuildHandler
{
    public function __construct(
        private ProjectContext $context,
        private Config $config,
        private Dispatcher $bus,
        private TaskProgress $progress,
    ) {}

    public function handle(RebuildSeoCommand $command): BackgroundTask
    {
        $projectId = $this->context->required();

        if ($this->alreadyRunning()) {
            throw ResearchRuleViolation::seoRebuildAlreadyRunning();
        }

        $taskId = $this->progress->queue(
            BackgroundTaskKind::SeoRebuild,
            'project',
            $projectId,
            $command->authorId,
        );

        $this->bus->dispatch(
            (new RebuildSeoJob($projectId, $command->entities, $taskId))
                ->onQueue((string) $this->config->get('cms-research.queue', 'research')),
        );

        return BackgroundTask::query()->findOrFail($taskId);
    }

    private function alreadyRunning(): bool
    {
        return BackgroundTask::query()
            ->where('kind', BackgroundTaskKind::SeoRebuild)
            ->active()
            ->exists();
    }
}
