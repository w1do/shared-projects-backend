<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/** Best-effort cache-bust downstream-сервисов при смене ролей / отзыве ключей. */
final class DownstreamNotifier
{
    public static function cacheBust(array $payload): void
    {
        foreach (config('cms-auth.downstream_urls', []) as $url) {
            try {
                Http::baseUrl($url)
                    ->timeout(2)
                    ->withToken((string) config('cms.service_token'), 'Service')
                    ->post('/internal/cache-bust', $payload);
            } catch (\Throwable $e) {
                Log::info('downstream cache-bust skipped', ['url' => $url, 'reason' => $e->getMessage()]);
            }
        }
    }
}
