<?php

declare(strict_types=1);

namespace Cms\Research\Application\DTOs\Research;

use Cms\Research\Domain\Models\ResearchSource;
use Spatie\LaravelData\Data;

final class ResearchSourceDTO extends Data
{
    public function __construct(
        public int $id,
        public string $url,
        public ?string $title,
        public ?string $sub_query,
        public int $position,
        public bool $indexed,
    ) {}

    public static function fromModel(ResearchSource $source): self
    {
        return new self(
            id: $source->id,
            url: $source->url,
            title: $source->title,
            sub_query: $source->sub_query,
            position: $source->position,
            indexed: $source->indexed_at !== null,
        );
    }
}
