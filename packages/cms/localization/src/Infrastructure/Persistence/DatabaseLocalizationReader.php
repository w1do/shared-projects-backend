<?php

declare(strict_types=1);

namespace Cms\Localization\Infrastructure\Persistence;

use Cms\Localization\Domain\Contracts\LocalizationReader;
use Cms\Localization\Domain\Contracts\LocalizePort;
use Cms\Localization\Domain\Models\Localization;

/** Чтение локализаций из БД текущего проекта с fallback на in-memory реестр. */
final class DatabaseLocalizationReader implements LocalizationReader
{
    public function __construct(private readonly LocalizePort $registry) {}

    public function get(string $service, string $key, string $locale): ?string
    {
        $row = Localization::query()
            ->where('service', $service)
            ->where('key', $key)
            ->where('locale', $locale)
            ->first();

        if ($row === null) {
            return $this->registry->defaultValue($service, $key, $locale);
        }

        return $row->value ?? $row->default_value;
    }
}
