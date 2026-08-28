<?php

/*
 * Настройки лицензирования (Д4): TTL лицензионных токенов и интервал
 * refresh поставок. Токен — не рычаг блокировки, только перенос entitlements,
 * поэтому TTL длинные: 30 дней онлайн, 1 год для офлайн-контуров.
 */
return [
    'token_ttl_days' => (int) env('LICENSING_TOKEN_TTL_DAYS', 30),
    'offline_token_ttl_days' => (int) env('LICENSING_OFFLINE_TOKEN_TTL_DAYS', 365),
    'refresh_in_seconds' => (int) env('LICENSING_REFRESH_IN_SECONDS', 86400),
];
