<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Queries;

/**
 * Плоский словарь `ключ → значение` для одной локали с откатом на локаль
 * по умолчанию. Ключи без значения в обеих локалях в словарь не попадают.
 */
final class TranslationDictionaryQuery
{
    public function __construct(private readonly ListTranslationsQuery $translations) {}

    /** @return array<string, string> */
    public function handle(string $locale, string $fallback): array
    {
        $dictionary = [];

        foreach ($this->translations->handle() as $translation) {
            $value = $translation->valueFor($locale, $fallback);
            if ($value !== null) {
                $dictionary[$translation->key] = $value;
            }
        }

        return $dictionary;
    }
}
