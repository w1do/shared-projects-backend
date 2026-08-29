<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Domain\Models\Post;

/** Команда-намерение: данные для DeletePostHandler. */
final readonly class DeletePostCommand
{
    public function __construct(public Post $post) {}
}
