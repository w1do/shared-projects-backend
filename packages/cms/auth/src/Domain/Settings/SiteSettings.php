<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Настройки сайта проекта: язык интерфейса и валюты.
 * Хранение — tenant-scoped (Cms\Shared\Settings\ProjectDatabaseSettingsRepository).
 */
final class SiteSettings extends Settings
{
    public string $language;

    public string $currency_default;

    /** @var list<string> ISO-4217 коды поддерживаемых валют */
    public array $currencies;

    public static function group(): string
    {
        return 'site';
    }

    /** @return array<string, mixed> значения нового проекта */
    public static function defaults(): array
    {
        return [
            'language' => 'ru',
            'currency_default' => 'RUB',
            'currencies' => ['RUB', 'USD'],
        ];
    }
}
