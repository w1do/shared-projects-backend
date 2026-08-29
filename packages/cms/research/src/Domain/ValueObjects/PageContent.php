<?php

declare(strict_types=1);

namespace Cms\Research\Domain\ValueObjects;

/** Текст страницы-источника, очищенный от разметки. */
final readonly class PageContent
{
    public function __construct(
        public string $link,
        public string $content,
        public ?string $title = null,
    ) {}
}
