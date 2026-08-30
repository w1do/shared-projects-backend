<?php

use Cms\Auth\Domain\Enums\ServiceName;

return [
    // Системные роли: super-admin — глобальная (project_id = null), остальные выдаются на проект.
    'system_roles' => [
        'super-admin' => [],
        'owner' => ['*'],
        'admin' => ['*'],
        'editor' => ['content.*'],
        'analyst' => ['analytics.*'],
        'viewer' => ['*.view'],
    ],

    // Сервисы платформы, которые можно включать на проект
    'services' => ServiceName::toggleable(),

    // Сервисы, включаемые автоматически при создании проекта.
    // Явное выключение администратором сохраняется — авто-включение его не перезаписывает.
    'default_enabled_services' => [],

    // Корневой оператор, создаваемый бутстрапом стека (operator:seed)
    'operator' => [
        'email' => env('ADMIN_EMAIL'),
        'password' => env('ADMIN_PASSWORD'),
    ],

    // Стартовый проект бутстрапа (project:seed): без проекта консоль пуста
    'initial_project' => [
        'key' => env('INITIAL_PROJECT_KEY', 'main'),
        'name' => env('INITIAL_PROJECT_NAME', 'Main'),
        'locales' => array_values(array_filter(array_map(
            'trim',
            explode(',', (string) env('INITIAL_PROJECT_LOCALES', 'ru')),
        ))),
    ],

    // Rate limit входа: попыток в минуту
    'login_rate_limit' => (int) env('AUTH_LOGIN_RATE_LIMIT', 5),

    // TTL reset-токена, минут
    'reset_token_ttl' => 60,

    // URL downstream-сервисов для cache-bust вебхуков (best effort)
    'downstream_urls' => array_filter([
        env('CONTENT_SERVICE_URL'),
        env('ANALYTICS_SERVICE_URL'),
        env('PAY_SERVICE_URL'),
    ]),
];
