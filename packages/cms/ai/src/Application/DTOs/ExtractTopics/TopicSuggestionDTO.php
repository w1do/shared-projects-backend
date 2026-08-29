<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\ExtractTopics;

use Spatie\LaravelData\Data;

final class TopicSuggestionDTO extends Data
{
    public function __construct(
        public string $title,
        /** Чем тема интересна: 1–2 предложения. */
        public string $rationale,
        /** Название категории: из переданных проекту либо предложенное новое. */
        public ?string $category = null,
    ) {}
}
