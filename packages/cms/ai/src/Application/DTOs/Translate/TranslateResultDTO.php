<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\Translate;

use Spatie\LaravelData\Data;

final class TranslateResultDTO extends Data
{
    public function __construct(
        /** @var array<string, array<string, string>> ключ → [локаль => перевод] */
        public array $translations,
    ) {}
}
