<?php

declare(strict_types=1);

namespace Cms\Research\Application\Commands;

final readonly class ExtractTopicsCommand
{
    public function __construct(
        public int $researchId,
        public ?int $maxCount = null,
    ) {}
}
