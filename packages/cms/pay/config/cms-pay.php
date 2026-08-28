<?php

declare(strict_types=1);

return [
    /*
     * Шлюз Platega (Д5): секреты — пер-проектные, в provider_accounts;
     * здесь только транспорт: базовый URL и таймауты HTTP-клиента.
     */
    'platega' => [
        'base_url' => env('PLATEGA_BASE_URL', 'https://app.platega.io'),
        'timeout' => (int) env('PLATEGA_TIMEOUT', 15),
        'connect_timeout' => (int) env('PLATEGA_CONNECT_TIMEOUT', 5),
    ],
];
