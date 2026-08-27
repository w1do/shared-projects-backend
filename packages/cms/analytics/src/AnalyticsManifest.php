<?php

declare(strict_types=1);

namespace Cms\Analytics;

use Cms\Contracts\Manifest\NavigationItem;
use Cms\Contracts\Manifest\PermissionDefinition;
use Cms\Contracts\Manifest\ServiceManifest;
use Cms\Contracts\Manifest\SettingDefinition;

final class AnalyticsManifest
{
    public const VERSION = '0.1.0';

    public static function build(): ServiceManifest
    {
        return new ServiceManifest(
            key: 'analytics',
            version: self::VERSION,
            permissions: [
                new PermissionDefinition('analytics.reports.view', 'Просмотр отчётов', 'reports'),
                new PermissionDefinition('analytics.reports.export', 'Экспорт отчётов', 'reports'),
                new PermissionDefinition('analytics.history.view', 'История пользователя', 'history'),
                new PermissionDefinition('analytics.settings.view', 'Просмотр настроек аналитики', 'settings'),
                new PermissionDefinition('analytics.settings.manage', 'Управление настройками аналитики', 'settings'),
            ],
            navigation: [
                new NavigationItem('analytics.overview', 'nav.analytics.overview', '/analytics', 'analytics.reports.view', 'bar-chart', 40),
                new NavigationItem('analytics.history', 'nav.analytics.history', '/analytics/history', 'analytics.history.view', 'clock', 41),
            ],
            settings: [
                new SettingDefinition('retention_months', 'integer', 'Срок хранения событий, мес.', 12, ['integer', 'min:1', 'max:36']),
            ],
        );
    }
}
