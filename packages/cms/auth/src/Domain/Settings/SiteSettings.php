<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Settings;

use Cms\Auth\Domain\Enums\ProjectType;
use DateTimeZone;
use Spatie\LaravelSettings\Settings;

/**
 * Настройки сайта проекта: вид сайта, часовой пояс, язык интерфейса и валюты.
 * Хранение — tenant-scoped (Cms\Shared\Settings\ProjectDatabaseSettingsRepository).
 */
final class SiteSettings extends Settings
{
    public string $project_type;

    public string $timezone;

    public string $language;

    public string $currency_default;

    /** @var list<string> ISO-4217 коды поддерживаемых валют */
    public array $currencies;

    public static function group(): string
    {
        return 'site';
    }

    /**
     * Часовые пояса России из tzdata PHP: перечень один и для проверки
     * запроса, и для выбора в консоли.
     *
     * @return list<string>
     */
    public static function timezones(): array
    {
        return DateTimeZone::listIdentifiers(DateTimeZone::PER_COUNTRY, 'RU');
    }

    /** @return list<string> ISO-4217 коды валют, поддерживаемых платформой */
    public static function currencyCodes(): array
    {
        return ['RUB', 'USD'];
    }

    /** @return array<string, mixed> значения нового проекта */
    public static function defaults(): array
    {
        return [
            'project_type' => ProjectType::Blog->value,
            'timezone' => 'Europe/Moscow',
            'language' => 'ru',
            'currency_default' => 'RUB',
            'currencies' => ['RUB', 'USD'],
        ];
    }
}
