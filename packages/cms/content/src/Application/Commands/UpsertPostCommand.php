<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Application\DTOs\Post\UpsertPostDTO;
use Cms\Content\Domain\Models\Post;

/** Команда-намерение: данные для UpsertPostHandler. */
final readonly class UpsertPostCommand
{
    public function __construct(
        public UpsertPostDTO $data,
        public ?Post $post = null,
        public ?string $authorId = null,
    ) {}
}
