<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Application\DTOs\Seo\UpsertSeoDTO;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;

/** Команда-намерение: данные для UpsertSeoHandler. */
final readonly class UpsertSeoCommand
{
    public function __construct(
        public Post|Page|Category $model,
        public UpsertSeoDTO $data,
    ) {}
}
