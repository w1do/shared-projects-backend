<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Persistence;

use Closure;
use Cms\Content\Domain\Contracts\ContentCache;
use Illuminate\Support\Facades\Cache;

/**
 * Кэш публичных ответов контента: версия на проект, purge = инкремент версии.
 *
 * Ключ `content:{projectId}:v{version}:{key}` переживает деплой, поэтому ни его
 * состав, ни форма значения не меняются без смены префикса (Safety Protocol, И12;
 * guard-тест 0.13).
 */
final class VersionedContentCache implements ContentCache
{
    public function remember(string $projectId, string $key, Closure $resolve): mixed
    {
        $version = (int) Cache::get("content:ver:{$projectId}", 1);
        $ttl = (int) config('cms-content.cache_ttl', 300);

        /** @var mixed */
        return Cache::remember("content:{$projectId}:v{$version}:{$key}", $ttl, fn (): mixed => $resolve());
    }

    public function purge(string $projectId): void
    {
        Cache::increment("content:ver:{$projectId}");
    }
}
