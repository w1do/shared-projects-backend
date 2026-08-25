<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Queries;

use Cms\Localization\Application\DTOs\Translation\TranslationDTO;
use Cms\Localization\Domain\Models\Translation;

/**
 * Полные записи словаря текущего проекта, отсортированные по ключу.
 * Порядок — часть контракта ответа: панель показывает словарь как есть.
 */
final class ListTranslationsQuery
{
    /** @return array<int, TranslationDTO> */
    public function handle(): array
    {
        return Translation::query()
            ->orderBy('key')
            ->get()
            ->map(fn (Translation $translation): TranslationDTO => TranslationDTO::fromModel($translation))
            ->all();
    }
}
