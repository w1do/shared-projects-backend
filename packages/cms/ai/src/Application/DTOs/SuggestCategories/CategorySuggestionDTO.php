<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\SuggestCategories;

use Spatie\LaravelData\Data;

final class CategorySuggestionDTO extends Data
{
    public function __construct(
        public string $name,
        public string $slug,
        /** @var list<CategorySuggestionDTO> */
        public array $children = [],
    ) {}
}
