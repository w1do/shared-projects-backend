<?php

// Все значения — только из окружения: смена поисковой службы или адреса базы
// знаний не требует правки кода.
return [
    // Поисковая служба (SerpApi-совместимая)
    'serpapi' => [
        'api_key' => env('SERPAPI_KEY'),
        'base_url' => env('SERPAPI_BASE_URL', 'https://serpapi.com'),
        'timeout' => (int) env('SERPAPI_TIMEOUT', 30),
    ],

    'engine' => env('RESEARCH_ENGINE', 'yandex'),
    'sub_queries_count' => (int) env('RESEARCH_SUBQUERIES_COUNT', 4),
    'results_per_sub_query' => (int) env('RESEARCH_RESULTS_PER_SUBQUERY', 5),
    'page_fetch_timeout' => (int) env('RESEARCH_PAGE_FETCH_TIMEOUT', 10),
    'max_content_length' => (int) env('RESEARCH_MAX_CONTENT_LENGTH', 5000),

    // Предел одновременно выполняющихся исследований на проект
    'max_concurrent' => (int) env('RESEARCH_MAX_CONCURRENT', 3),

    // Ресёрч идёт минутами: своя очередь, чтобы не занимать обработчиков медиа
    'queue' => env('RESEARCH_QUEUE', 'research'),

    // База знаний
    'qdrant' => [
        'url' => env('QDRANT_URL', 'http://qdrant:6333'),
        'api_key' => env('QDRANT_API_KEY'),
        'collection' => env('QDRANT_COLLECTION', 'knowledge'),
        'timeout' => (int) env('QDRANT_TIMEOUT', 15),
    ],

    // Сколько записей базы знаний уходит в модель при написании поста
    'post_context_limit' => (int) env('RESEARCH_POST_CONTEXT_LIMIT', 12),
];
