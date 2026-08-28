<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Queries;

use Cms\Localization\Application\DTOs\Localization\LocalizationDTO;
use Cms\Localization\Domain\Models\Localization;

/**
 * Строки реестра локализаций текущего проекта, отсортированные по
 * (service, key, locale). Порядок — часть контракта ответа.
 */
final class ListLocalizationsQuery
{
    /** @return array<int, LocalizationDTO> */
    public function handle(?string $service = null, ?string $locale = null): array
    {
        return Localization::query()
            ->when($service !== null, fn ($query) => $query->where('service', $service))
            ->when($locale !== null, fn ($query) => $query->where('locale', $locale))
            ->orderBy('service')
            ->orderBy('key')
            ->orderBy('locale')
            ->get()
            ->map(fn (Localization $localization): LocalizationDTO => LocalizationDTO::fromModel($localization))
            ->all();
    }
}
