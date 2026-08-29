<?php

declare(strict_types=1);

namespace Cms\Research\Application\Commands;

use Cms\Research\Application\DTOs\Research\StartResearchDTO;

final readonly class StartResearchCommand
{
    public function __construct(
        public StartResearchDTO $data,
        public ?string $authorId = null,
    ) {}
}
