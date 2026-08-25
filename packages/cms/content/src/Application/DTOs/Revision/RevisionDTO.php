<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Revision;

use Cms\Content\Domain\Models\Revision;
use Spatie\LaravelData\Data;

/**
 * Ревизия поста/страницы на выдачу.
 *
 * Заменяет ручной массив из `ListRevisionsQuery` (задача 5.9): состав и порядок
 * ключей прежние (снимки `posts-revisions`, `pages-revisions`).
 */
final class RevisionDTO extends Data
{
    /** @param  array<string, mixed>  $snapshot */
    public function __construct(
        public int $id,
        public array $snapshot,
        public ?string $author_id,
        public ?string $created_at,
    ) {}

    public static function fromModel(Revision $revision): self
    {
        return new self(
            id: $revision->id,
            snapshot: (array) $revision->snapshot,
            author_id: $revision->author_id,
            created_at: $revision->created_at?->toIso8601String(),
        );
    }
}
