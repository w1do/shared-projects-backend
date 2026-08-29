<?php

declare(strict_types=1);

namespace Cms\Research\Domain\ValueObjects;

/** Отбор при поиске по базе знаний: категория и диапазон дат. */
final readonly class KnowledgeFilter
{
    public function __construct(
        public ?string $category = null,
        public ?string $from = null,
        public ?string $to = null,
        public ?int $researchId = null,
    ) {}
}
