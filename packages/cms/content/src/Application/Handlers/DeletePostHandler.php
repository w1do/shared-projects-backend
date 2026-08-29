<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\DeletePostCommand;
use Cms\Content\Domain\Events\PostDeleted;
use Cms\Content\Infrastructure\Jobs\PurgeContentCacheJob;
use Cms\Content\Infrastructure\Jobs\RegenerateSitemapJob;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Database\ConnectionInterface;

/**
 * Удаление поста вместе с его хвостом.
 *
 * Связи поста удаляются явно: привязка к категориям и теги уходят каскадом
 * внешнего ключа, а полиморфные SEO и ревизии внешнего ключа не имеют —
 * без явной очистки они остались бы висеть на удалённом посте.
 */
final readonly class DeletePostHandler
{
    public function __construct(
        private ConnectionInterface $connection,
        private Dispatcher $events,
    ) {}

    public function handle(DeletePostCommand $command): void
    {
        $post = $command->post;
        $projectId = $post->project_id;
        $postId = (int) $post->getKey();

        $this->connection->transaction(function () use ($post): void {
            $post->seo()->delete();
            $post->revisions()->delete();
            $post->tags()->detach();
            $post->categories()->detach();
            $post->delete();
        });

        PurgeContentCacheJob::dispatch($projectId);
        RegenerateSitemapJob::dispatch($projectId);

        // Ссылки на пост живут за пределами пакета контента (например, тема
        // ресёрча): о них знают подписчики события, а не этот handler.
        $this->events->dispatch(new PostDeleted($projectId, $postId));
    }
}
