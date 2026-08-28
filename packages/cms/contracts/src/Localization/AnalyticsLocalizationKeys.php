<?php

declare(strict_types=1);

namespace Cms\Contracts\Localization;

/** Ключи локализации сервиса analytics: навигация манифеста и карточка сервиса. */
enum AnalyticsLocalizationKeys: string implements LocalizationKeys
{
    use EnumeratesKeys;

    case NavOverview = 'nav.analytics.overview';
    case NavHistory = 'nav.analytics.history';
    case ServiceTitle = 'service.analytics.title';
    case ServiceDescription = 'service.analytics.description';

    public static function service(): string
    {
        return 'analytics';
    }

    public static function locale(): string
    {
        return 'ru';
    }

    public function defaultValue(): string
    {
        return match ($this) {
            self::NavOverview => 'Аналитика',
            self::NavHistory => 'История посетителя',
            self::ServiceTitle => 'Аналитика',
            self::ServiceDescription => 'Сбор событий и отчёты посещаемости',
        };
    }
}
