<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\ExtractTopics;

use Spatie\LaravelData\Data;

final class TopicListDTO extends Data
{
    public function __construct(
        /** @var list<TopicSuggestionDTO> */
        public array $topics,
    ) {}
}
