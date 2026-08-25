<?php

return [
    'media_disk' => env('CONTENT_MEDIA_DISK', 's3'),
    'artifacts_disk' => env('CONTENT_ARTIFACTS_DISK', 'local'),
    'cache_ttl' => (int) env('CONTENT_CACHE_TTL', 300),
    'site_url' => env('CONTENT_SITE_URL'),
    'robots' => [
        'disallow' => ['/api/', '/admin/'],
    ],
];
