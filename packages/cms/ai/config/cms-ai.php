<?php

// Все значения — только из окружения. Polza — OpenAI-совместимый провайдер,
// поэтому смена сервиса = смена OPENAI_BASE_URL и OPENAI_API_KEY, без кода.
return [
    'provider' => env('CMS_AI_PROVIDER', 'openai'),
    'api_key' => env('OPENAI_API_KEY'),
    'base_url' => env('OPENAI_BASE_URL', 'https://polza.ai/api/v1'),
    'model' => env('CMS_AI_MODEL', 'openai/gpt-5.4-mini'),
    'timeout' => (int) env('CMS_AI_TIMEOUT', 30),

    // Векторные представления. Размерность объявляется здесь, а не берётся из
    // пробного ответа: хранилище базы знаний создаётся под неё до первого вызова.
    'embedding_model' => env('CMS_AI_EMBEDDING_MODEL', 'openai/text-embedding-3-small'),
    'embedding_dimension' => (int) env('CMS_AI_EMBEDDING_DIMENSION', 1536),
];
