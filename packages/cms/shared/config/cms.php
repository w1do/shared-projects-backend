<?php

return [
    // Базовые URL сервисов платформы (внутренняя docker-сеть)
    'auth_url' => env('AUTH_SERVICE_URL', 'http://auth-service:8000'),
    'analytics_url' => env('ANALYTICS_SERVICE_URL'),

    // Токен service-to-service вызовов
    'service_token' => env('SERVICE_TOKEN', ''),

    // TTL кэша introspection, сек (60–120 по design)
    'introspection_ttl' => (int) env('INTROSPECTION_CACHE_TTL', 90),
];
