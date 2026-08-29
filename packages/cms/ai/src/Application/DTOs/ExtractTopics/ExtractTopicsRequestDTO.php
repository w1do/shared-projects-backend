<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\ExtractTopics;

use Spatie\LaravelData\Data;

final class ExtractTopicsRequestDTO extends Data
{
    public function __construct(
        /** Исходный запрос исследования. */
        public string $query,
        /** @var list<string> собранные материалы, из которых выводятся темы */
        public array $materials,
        public int $maxCount = 10,
        /** @var list<string> названия категорий проекта для сопоставления */
        public array $categories = [],
        public string $locale = 'ru',
        /** Правило инструкции проекта, если задано. */
        public ?string $rule = null,
    ) {}
}
