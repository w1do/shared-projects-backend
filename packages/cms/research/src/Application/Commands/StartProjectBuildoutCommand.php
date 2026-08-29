<?php

declare(strict_types=1);

namespace Cms\Research\Application\Commands;

use Cms\Research\Application\DTOs\Buildout\StartBuildoutDTO;

final readonly class StartProjectBuildoutCommand
{
    public function __construct(
        public StartBuildoutDTO $data,
        public ?string $authorId = null,
    ) {}
}
