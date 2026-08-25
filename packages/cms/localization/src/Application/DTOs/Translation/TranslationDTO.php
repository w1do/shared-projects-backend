<?php

declare(strict_types=1);

namespace Cms\Localization\Application\DTOs\Translation;

use Cms\Localization\Domain\Models\Translation;
use Spatie\LaravelData\Data;

final class TranslationDTO extends Data
{
    public function __construct(
        public int $id,
        public string $key,
        /** @var array<string, string> */
        public array $values,
        /** @var array<string, bool> локали, заполненные автопереводом */
        public array $machine,
    ) {}

    public static function fromModel(Translation $translation): self
    {
        return new self(
            id: $translation->id,
            key: $translation->key,
            values: $translation->values,
            machine: array_filter($translation->machine),
        );
    }

    /** Значение локали с откатом на локаль по умолчанию. */
    public function valueFor(string $locale, string $fallback): ?string
    {
        return $this->values[$locale] ?? $this->values[$fallback] ?? null;
    }
}
