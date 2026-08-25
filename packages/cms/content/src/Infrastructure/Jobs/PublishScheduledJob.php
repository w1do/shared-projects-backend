<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Jobs;

use Cms\Content\Application\Commands\ChangeStatusCommand;
use Cms\Content\Application\DTOs\Status\ChangeStatusDTO;
use Cms\Content\Application\Handlers\ChangeStatusHandler;
use Cms\Content\Domain\Enums\ContentStatus;
use Cms\Content\Domain\Models\Post;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;

/** Раз в минуту публикует посты, у которых наступило scheduled_at (по всем проектам). */
final class PublishScheduledJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;

    public int $timeout = 55;

    public function handle(ChangeStatusHandler $changeStatus, ProjectContext $context): void
    {
        $due = Post::acrossProjects()
            ->where('status', ContentStatus::Scheduled)
            ->where('scheduled_at', '<=', now())
            ->get();

        foreach ($due as $post) {
            $context->set($post->project_id);
            try {
                $changeStatus->handle(new ChangeStatusCommand($post, ChangeStatusDTO::from(['status' => 'published'])));
            } finally {
                $context->clear();
            }
        }
    }
}
