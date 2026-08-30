<?php

return [
    'media_disk' => env('CONTENT_MEDIA_DISK', 's3'),
    'artifacts_disk' => env('CONTENT_ARTIFACTS_DISK', 'local'),
    'cache_ttl' => (int) env('CONTENT_CACHE_TTL', 300),
    'site_url' => env('CONTENT_SITE_URL'),
    // Предел размера медиа — общий для загрузки формой и импорта по ссылке
    'media_max_size_kb' => (int) env('CONTENT_MEDIA_MAX_SIZE_KB', 20480),
    'media_import' => [
        'timeout' => (int) env('CONTENT_MEDIA_IMPORT_TIMEOUT', 10),
        'max_redirects' => (int) env('CONTENT_MEDIA_IMPORT_MAX_REDIRECTS', 3),
        'mimes' => [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            'image/avif' => 'avif',
        ],
    ],
    // Справочник городов: по умолчанию поставляемая копия, источник переопределяется
    // переменной окружения или аргументом `city:sync`.
    'city_directory_path' => env('CONTENT_CITY_DIRECTORY', __DIR__.'/../resources/geo/russia-cities.json'),
    // Стартовый набор городов проекта: крупнейшие по населению.
    'city_starter_size' => (int) env('CONTENT_CITY_STARTER_SIZE', 10),
    'robots' => [
        'disallow' => ['/api/', '/admin/'],
    ],
];
