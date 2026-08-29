<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Events;

/**
 * Пост удалён.
 *
 * Событие нужно потребителям, которые ссылаются на пост извне пакета контента:
 * content о них не знает и знать не должен.
 */
final readonly class PostDeleted
{
    public function __construct(
        public string $projectId,
        public int $postId,
    ) {}
}
