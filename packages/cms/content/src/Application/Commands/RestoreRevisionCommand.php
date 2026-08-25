<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;
use Cms\Content\Domain\Models\Revision;

/** Команда-намерение: данные для RestoreRevisionHandler. */
final readonly class RestoreRevisionCommand
{
    public function __construct(
        public Post|Page $model,
        public Revision $revision,
        public ?string $authorId = null,
    ) {}
}
