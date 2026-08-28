<?php

declare(strict_types=1);

namespace Cms\Analytics\Domain\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Конфигурация внешних провайдеров аналитики проекта (Яндекс.Метрика / Google).
 * Хранение — tenant-scoped (Cms\Shared\Settings\ProjectDatabaseSettingsRepository).
 */
final class AnalyticsSettings extends Settings
{
    public bool $yandex_enabled;

    public ?string $yandex_id;

    public bool $google_enabled;

    public ?string $google_id;

    public static function group(): string
    {
        return 'analytics';
    }

    /** @return array<string, mixed> значения нового проекта */
    public static function defaults(): array
    {
        return [
            'yandex_enabled' => false,
            'yandex_id' => null,
            'google_enabled' => false,
            'google_id' => null,
        ];
    }
}
