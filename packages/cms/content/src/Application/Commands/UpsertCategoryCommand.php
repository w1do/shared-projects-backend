<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Application\DTOs\Category\UpsertCategoryDTO;
use Cms\Content\Domain\Models\Category;

/** Команда-намерение: данные для UpsertCategoryHandler. */
final readonly class UpsertCategoryCommand
{
    public function __construct(
        public UpsertCategoryDTO $data,
        public ?Category $category = null,
    ) {}
}
