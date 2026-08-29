<?php

declare(strict_types=1);

namespace Cms\Research\Domain\ValueObjects;

/** Одна органическая позиция выдачи по подзапросу. */
final readonly class SearchResultItem
{
    public function __construct(
        public int $position,
        public string $title,
        public string $link,
        public ?string $snippet = null,
    ) {}
}
