<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\SuggestCategories;

use Spatie\LaravelData\Data;

final class CategoryTreeDTO extends Data
{
    public function __construct(
        /** @var list<CategorySuggestionDTO> корневые категории с потомками */
        public array $categories,
    ) {}
}
