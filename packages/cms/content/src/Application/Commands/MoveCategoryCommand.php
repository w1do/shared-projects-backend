<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Application\DTOs\Category\MoveCategoryDTO;
use Cms\Content\Domain\Models\Category;

/** Команда-намерение: данные для MoveCategoryHandler. */
final readonly class MoveCategoryCommand
{
    public function __construct(
        public Category $category,
        public MoveCategoryDTO $data,
    ) {}
}
