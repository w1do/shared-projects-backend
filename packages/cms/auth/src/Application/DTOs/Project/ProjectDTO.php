<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Project;

use Cms\Auth\Domain\Models\Project;
use Spatie\LaravelData\Data;

final class ProjectDTO extends Data
{
    /** @param list<string> $locales */
    public function __construct(
        public string $id,
        public string $key,
        public string $name,
        public array $locales,
        public ?string $archived_at,
    ) {}

    public static function fromModel(Project $project): self
    {
        return new self(
            id: $project->id,
            key: $project->key,
            name: $project->name,
            locales: $project->locales ?? [],
            archived_at: $project->archived_at?->toIso8601String(),
        );
    }
}
