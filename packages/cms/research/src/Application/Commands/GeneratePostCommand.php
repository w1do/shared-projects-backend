<?php

declare(strict_types=1);

namespace Cms\Research\Application\Commands;

final readonly class GeneratePostCommand
{
    public function __construct(
        public int $topicId,
        public ?string $authorId = null,
    ) {}
}
