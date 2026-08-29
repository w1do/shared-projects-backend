<?php

declare(strict_types=1);

namespace Cms\Research\Application\DTOs\Topic;

use Cms\Research\Domain\Models\ResearchTopic;
use Spatie\LaravelData\Data;

final class TopicDTO extends Data
{
    public function __construct(
        public int $id,
        public int $research_id,
        public string $title,
        public ?string $rationale,
        public ?int $category_id,
        public ?string $suggested_category,
        public string $status,
        public string $status_label,
        public ?int $post_id,
        public ?string $created_at,
    ) {}

    public static function fromModel(ResearchTopic $topic): self
    {
        return new self(
            id: $topic->id,
            research_id: $topic->research_id,
            title: $topic->title,
            rationale: $topic->rationale,
            category_id: $topic->category_id,
            suggested_category: $topic->suggested_category,
            status: $topic->status->value,
            status_label: $topic->status->label(),
            post_id: $topic->post_id,
            created_at: $topic->created_at?->toIso8601String(),
        );
    }
}
