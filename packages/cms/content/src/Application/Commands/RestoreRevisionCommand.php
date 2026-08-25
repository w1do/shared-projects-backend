<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;
use Cms\Content\Domain\Models\Revision;

/**
 * Команда-намерение: данные для RestoreRevisionHandler.
 *
 * @template TModel of Post|Page
 */
final readonly class RestoreRevisionCommand
{
    /** @param  TModel  $model */
    public function __construct(
        public Post|Page $model,
        public Revision $revision,
        public ?string $authorId = null,
    ) {}
}
