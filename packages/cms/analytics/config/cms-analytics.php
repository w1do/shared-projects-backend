<?php

return [
    'clickhouse' => [
        'host' => env('CLICKHOUSE_HOST', 'clickhouse'),
        'port' => (int) env('CLICKHOUSE_PORT', 8123),
        'database' => env('CLICKHOUSE_DATABASE', 'analytics'),
        'username' => env('CLICKHOUSE_USERNAME', 'platform'),
        'password' => env('CLICKHOUSE_PASSWORD', ''),
        'timeout' => 10,
    ],

    'batch_size' => (int) env('ANALYTICS_BATCH_SIZE', 5000),
    'flush_interval' => (int) env('ANALYTICS_FLUSH_INTERVAL', 2), // секунды

    'ip_salt' => env('ANALYTICS_IP_SALT', 'change-me'),

    // rate limit /collect: событий в минуту на ключ проекта
    'collect_rate_limit' => (int) env('ANALYTICS_COLLECT_RATE_LIMIT', 600),
];
