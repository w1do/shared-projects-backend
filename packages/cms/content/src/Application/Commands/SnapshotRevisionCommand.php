<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;

/** Команда-намерение: данные для SnapshotRevisionHandler. */
final readonly class SnapshotRevisionCommand
{
    public function __construct(
        public Post|Page $model,
        public ?string $authorId = null,
    ) {}
}
