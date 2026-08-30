<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Content\Domain\Models\Post;
use Cms\Research\Application\Commands\RebuildPostCommand;
use Cms\Research\Infrastructure\Jobs\RebuildPostJob;
use Cms\Shared\BackgroundTasks\BackgroundTask;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Contracts\Config\Repository as Config;

/** Постановка пересборки поста в очередь: пост проверяется до неё. */
final readonly class StartPostRebuildHandler
{
    public function __construct(
        private ProjectContext $context,
        private Config $config,
        private Dispatcher $bus,
        private TaskProgress $progress,
    ) {}

    public function handle(RebuildPostCommand $command): BackgroundTask
    {
        $post = Post::query()->findOrFail($command->postId);

        // Запись заводится до постановки в очередь: оператор видит «принята»,
        // не дожидаясь, пока обработчик возьмёт задачу.
        $taskId = $this->progress->queue(
            BackgroundTaskKind::PostRebuild,
            'post',
            (string) $post->getKey(),
            $command->authorId,
        );

        $this->bus->dispatch(
            (new RebuildPostJob($this->context->required(), (int) $post->getKey(), $command->authorId, $taskId))
                ->onQueue((string) $this->config->get('cms-research.queue', 'research')),
        );

        return BackgroundTask::query()->findOrFail($taskId);
    }
}
