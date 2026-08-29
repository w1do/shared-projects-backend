<?php

declare(strict_types=1);

namespace Cms\Research\Application\DTOs\Research;

use Cms\Research\Domain\Models\Research;
use Cms\Research\Domain\Models\ResearchSource;
use Spatie\LaravelData\Data;

final class ResearchDTO extends Data
{
    /**
     * @param  list<string>  $sub_queries
     * @param  list<ResearchSourceDTO>  $sources
     */
    public function __construct(
        public int $id,
        public string $query,
        public ?string $offer,
        public string $engine,
        public string $status,
        public string $status_label,
        public string $progress_stage,
        public string $progress_stage_label,
        public array $sub_queries,
        public ?string $summary,
        public ?string $error_message,
        public int $sources_count,
        public int $topics_count,
        public ?string $started_at,
        public ?string $completed_at,
        public ?string $created_at,
        public array $sources = [],
    ) {}

    public static function fromModel(Research $research, bool $withSources = false): self
    {
        return new self(
            id: $research->id,
            query: $research->query,
            offer: $research->offer,
            engine: $research->engine->value,
            status: $research->status->value,
            status_label: $research->status->label(),
            progress_stage: $research->progress_stage->value,
            progress_stage_label: $research->progress_stage->label(),
            sub_queries: array_values(array_map('strval', $research->sub_queries ?? [])),
            summary: $research->summary,
            error_message: $research->error_message,
            sources_count: (int) ($research->sources_count ?? $research->sources()->count()),
            topics_count: (int) ($research->topics_count ?? $research->topics()->count()),
            started_at: $research->started_at?->toIso8601String(),
            completed_at: $research->completed_at?->toIso8601String(),
            created_at: $research->created_at?->toIso8601String(),
            sources: $withSources
                ? $research->sources->map(static fn (ResearchSource $source): ResearchSourceDTO => ResearchSourceDTO::fromModel($source))->all()
                : [],
        );
    }
}
