<?php

declare(strict_types=1);

namespace Cms\Research\Application\Commands;

/** Команда-намерение: пересобрать текст существующего поста через AI. */
final readonly class RebuildPostCommand
{
    public function __construct(
        public int $postId,
        public ?string $authorId = null,
        /** Запись реестра фоновых задач, в которую пишется ход работы. */
        public ?int $taskId = null,
    ) {}
}
