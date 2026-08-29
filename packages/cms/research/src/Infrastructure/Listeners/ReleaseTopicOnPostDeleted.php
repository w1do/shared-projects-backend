<?php

declare(strict_types=1);

namespace Cms\Research\Infrastructure\Listeners;

use Cms\Content\Domain\Events\PostDeleted;
use Cms\Research\Domain\Enums\TopicStatus;
use Cms\Research\Domain\Models\ResearchTopic;

/**
 * Пост удалён — тема снова свободна.
 *
 * Иначе тема осталась бы «использованной» со ссылкой на несуществующий пост:
 * оператор не смог бы ни открыть его, ни написать по теме заново.
 */
final readonly class ReleaseTopicOnPostDeleted
{
    public function handle(PostDeleted $event): void
    {
        ResearchTopic::acrossProjects()
            ->where('project_id', $event->projectId)
            ->where('post_id', $event->postId)
            ->update(['post_id' => null, 'status' => TopicStatus::Suggested]);
    }
}
