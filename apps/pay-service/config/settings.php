<?php

declare(strict_types=1);

use Cms\Pay\Domain\Settings\PaymentsSettings;
use Cms\Shared\Settings\ProjectDatabaseSettingsRepository;

return [
    // Классы настроек перечислены явно — автопоиск отключён.
    'settings' => [
        PaymentsSettings::class,
    ],

    // Tenant-scoped хранилище: строки settings принадлежат проекту.
    'repositories' => [
        'database' => [
            'type' => ProjectDatabaseSettingsRepository::class,
            'model' => null,
            'table' => null,
            'connection' => null,
        ],
    ],

    'auto_discover_settings' => [],
];
