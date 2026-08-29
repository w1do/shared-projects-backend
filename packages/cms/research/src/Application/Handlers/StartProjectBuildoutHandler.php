<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Research\Application\Commands\StartProjectBuildoutCommand;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Domain\Models\ProjectBuildout;
use Cms\Research\Infrastructure\Jobs\BuildProjectJob;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Contracts\Config\Repository as Config;

/** Вторая сборка при незавершённой первой не создаётся. */
final readonly class StartProjectBuildoutHandler
{
    public function __construct(
        private ProjectContext $context,
        private Config $config,
        private Dispatcher $bus,
        private TaskProgress $progress,
    ) {}

    public function handle(StartProjectBuildoutCommand $command): ProjectBuildout
    {
        $projectId = $this->context->required();

        if (ProjectBuildout::query()->running()->exists()) {
            throw ResearchRuleViolation::buildoutAlreadyRunning();
        }

        $buildout = ProjectBuildout::create([
            'project_id' => $projectId,
            'topic' => $command->data->topic,
            'overwrite' => $command->data->overwrite,
            'author_id' => $command->authorId,
        ]);

        $taskId = $this->progress->queue(
            BackgroundTaskKind::ProjectBuildout,
            'buildout',
            (string) $buildout->getKey(),
            $command->authorId,
        );

        $this->bus->dispatch(
            (new BuildProjectJob($projectId, (int) $buildout->getKey(), $taskId))
                ->onQueue((string) $this->config->get('cms-research.queue', 'research')),
        );

        return $buildout;
    }
}
