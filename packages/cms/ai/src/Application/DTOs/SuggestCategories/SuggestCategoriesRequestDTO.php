<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\SuggestCategories;

use Spatie\LaravelData\Data;

final class SuggestCategoriesRequestDTO extends Data
{
    public function __construct(
        /** Описание проекта: тематика, аудитория, тип контента. */
        public string $projectDescription,
        public ?int $maxCount = null,
        /** Локаль имён категорий; slug всегда латиницей. */
        public string $locale = 'en',
    ) {}
}
