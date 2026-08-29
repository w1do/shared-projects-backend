<?php

declare(strict_types=1);

namespace Cms\Instructs\Application\Commands;

use Cms\Instructs\Application\DTOs\Instruct\UpsertInstructDTO;

final readonly class UpsertInstructCommand
{
    public function __construct(
        public UpsertInstructDTO $data,
        public ?int $instructId = null,
        public ?string $authorId = null,
    ) {}
}
