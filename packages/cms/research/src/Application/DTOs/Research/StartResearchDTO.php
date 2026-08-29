<?php

declare(strict_types=1);

namespace Cms\Research\Application\DTOs\Research;

use Spatie\LaravelData\Data;

/** Чистая структура между слоями: валидация — в FormRequest. */
final class StartResearchDTO extends Data
{
    public function __construct(
        public string $query,
        public ?string $offer = null,
        public ?string $engine = null,
        public ?int $subQueriesCount = null,
        public ?int $resultsPerSubQuery = null,
    ) {}

    /** @param array<string, mixed> $data провалидированные данные запроса */
    public static function fromValidated(array $data): self
    {
        /** @var array{query: string, offer?: ?string, engine?: ?string, sub_queries_count?: ?int, results_per_sub_query?: ?int} $data */
        return new self(
            query: $data['query'],
            offer: $data['offer'] ?? null,
            engine: $data['engine'] ?? null,
            subQueriesCount: isset($data['sub_queries_count']) ? (int) $data['sub_queries_count'] : null,
            resultsPerSubQuery: isset($data['results_per_sub_query']) ? (int) $data['results_per_sub_query'] : null,
        );
    }
}
