<?php

// Все значения — только из окружения. Polza — OpenAI-совместимый провайдер,
// поэтому смена сервиса = смена OPENAI_BASE_URL и OPENAI_API_KEY, без кода.
return [
    'provider' => env('CMS_AI_PROVIDER', 'openai'),
    'api_key' => env('OPENAI_API_KEY'),
    'base_url' => env('OPENAI_BASE_URL', 'https://polza.ai/api/v1'),
    'model' => env('CMS_AI_MODEL', 'openai/gpt-5.4-mini'),
    'timeout' => (int) env('CMS_AI_TIMEOUT', 30),
];
