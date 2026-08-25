<?php

declare(strict_types=1);

namespace Cms\Shared\Cache;

use Illuminate\Contracts\Cache\Repository as Cache;

/**
 * Best-effort сброс кэша сервиса по сигналу auth-service:
 * инвалидация introspection/bootstrap-кэшей после изменения прав или манифестов.
 */
final class CacheBustHandler
{
    public function __construct(private readonly Cache $cache) {}

    public function handle(): void
    {
        $this->cache->getStore()->flush();
    }
}
