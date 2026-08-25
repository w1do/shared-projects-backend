<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\Translate;

use Spatie\LaravelData\Data;

final class TranslateRequestDTO extends Data
{
    public function __construct(
        /** @var array<string, string> ключ → исходный текст */
        public array $texts,
        /** @var list<string> целевые локали, например ['en', 'ru'] */
        public array $targetLocales,
        public ?string $sourceLocale = null,
        /** Контекст для переводчика: предметная область, тон. */
        public ?string $context = null,
    ) {}
}
