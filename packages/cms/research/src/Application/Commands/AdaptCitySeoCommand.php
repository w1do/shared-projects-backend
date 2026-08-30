<?php

declare(strict_types=1);

namespace Cms\Research\Application\Commands;

/** Адаптация SEO включённых городов проекта под тематику. */
final readonly class AdaptCitySeoCommand
{
    public function __construct(
        public ?string $topic = null,
        public ?string $authorId = null,
        public ?int $taskId = null,
    ) {}
}
