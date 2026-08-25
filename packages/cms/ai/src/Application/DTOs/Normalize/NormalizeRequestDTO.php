<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\Normalize;

use Spatie\LaravelData\Data;

final class NormalizeRequestDTO extends Data
{
    public function __construct(
        public string $text,
        /** Профиль нормализации: пунктуация, регистр, типографика; null — общий. */
        public ?string $profile = null,
    ) {}
}
