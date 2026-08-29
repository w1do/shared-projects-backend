<?php

declare(strict_types=1);

namespace Cms\Research\Application\DTOs\Buildout;

use Cms\Research\Domain\Models\ProjectBuildout;
use Spatie\LaravelData\Data;

final class BuildoutDTO extends Data
{
    public function __construct(
        public int $id,
        public string $topic,
        public string $status,
        public string $status_label,
        public int $categories_created,
        public bool $project_updated,
        public ?string $error_message,
        public ?string $completed_at,
        public ?string $created_at,
    ) {}

    public static function fromModel(ProjectBuildout $buildout): self
    {
        return new self(
            id: $buildout->id,
            topic: $buildout->topic,
            status: $buildout->status->value,
            status_label: $buildout->status->label(),
            categories_created: $buildout->categories_created,
            project_updated: $buildout->project_updated,
            error_message: $buildout->error_message,
            completed_at: $buildout->completed_at?->toIso8601String(),
            created_at: $buildout->created_at?->toIso8601String(),
        );
    }
}
