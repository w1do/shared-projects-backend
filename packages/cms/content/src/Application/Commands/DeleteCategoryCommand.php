<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Domain\Models\Category;

/** Команда-намерение: данные для DeleteCategoryHandler. */
final readonly class DeleteCategoryCommand
{
    public function __construct(
        public Category $category,
    ) {}
}
