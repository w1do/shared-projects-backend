<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Revision;

use Cms\Content\Domain\Models\Revision;
use Spatie\LaravelData\Data;

/** Ревизия поста/страницы на выдачу: `number` — порядок версии в истории носителя. */
final class RevisionDTO extends Data
{
    /** @param  array<string, mixed>  $snapshot */
    public function __construct(
        public int $id,
        public int $number,
        public string $title,
        public array $snapshot,
        public ?string $author_id,
        public ?string $created_at,
    ) {}

    public static function fromModel(Revision $revision, int $number): self
    {
        $snapshot = (array) $revision->snapshot;

        return new self(
            id: $revision->id,
            number: $number,
            title: (string) ($snapshot['title'] ?? ''),
            snapshot: $snapshot,
            author_id: $revision->author_id,
            created_at: $revision->created_at?->toIso8601String(),
        );
    }
}
