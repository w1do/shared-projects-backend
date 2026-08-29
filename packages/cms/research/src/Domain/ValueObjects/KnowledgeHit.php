<?php

declare(strict_types=1);

namespace Cms\Research\Domain\ValueObjects;

/** Найденная запись базы знаний с мерой близости. */
final readonly class KnowledgeHit
{
    public function __construct(
        public string $topic,
        public string $query,
        public string $content,
        public string $category,
        public string $createdAt,
        public float $score,
        public ?int $researchId = null,
        public ?string $sourceUrl = null,
        public ?string $sourceTitle = null,
    ) {}
}
