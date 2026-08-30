<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Domain\Models\Post;

/** Команда-намерение: данные для DeleteRevisionHandler. */
final readonly class DeleteRevisionCommand
{
    public function __construct(
        public Post $post,
        public int $revisionId,
    ) {}
}
