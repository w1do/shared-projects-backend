<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Research\Application\Commands\GeneratePostCommand;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Domain\Enums\TopicStatus;
use Cms\Research\Domain\Models\ResearchTopic;
use Cms\Research\Infrastructure\Jobs\GeneratePostJob;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/** Постановка генерации поста в очередь: пригодность темы проверяется до неё. */
final readonly class StartPostGenerationHandler
{
    public function __construct(
        private ProjectContext $context,
        private Config $config,
        private Dispatcher $bus,
        private TaskProgress $progress,
    ) {}

    public function handle(GeneratePostCommand $command): ResearchTopic
    {
        $topic = ResearchTopic::query()->whereKey($command->topicId)->first();

        if ($topic === null) {
            throw (new ModelNotFoundException)->setModel(ResearchTopic::class, [$command->topicId]);
        }

        if ($topic->status === TopicStatus::Used) {
            throw ResearchRuleViolation::topicAlreadyUsed();
        }

        if ($topic->status === TopicStatus::Rejected) {
            throw ResearchRuleViolation::topicRejected();
        }

        // Запись заводится до постановки в очередь: оператор видит «принята»,
        // не дожидаясь, пока обработчик возьмёт задачу.
        $taskId = $this->progress->queue(
            BackgroundTaskKind::PostGeneration,
            'topic',
            (string) $topic->getKey(),
            $command->authorId,
        );

        $this->bus->dispatch(
            (new GeneratePostJob($this->context->required(), (int) $topic->getKey(), $command->authorId, $taskId))
                ->onQueue((string) $this->config->get('cms-research.queue', 'research')),
        );

        return $topic;
    }
}
