<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\Rewrite;

use Spatie\LaravelData\Data;

final class RewriteRequestDTO extends Data
{
    public function __construct(
        public string $text,
        /** Инструкция редактирования: тон, стиль, сокращение и т.п. */
        public string $instruction,
    ) {}
}
