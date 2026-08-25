<?php

declare(strict_types=1);

namespace Cms\Shared\AuthClient;

use Cms\Contracts\Introspection\IntrospectionResult;
use Illuminate\Contracts\Cache\Repository as Cache;

/**
 * Introspection с кэшем в Redis: TTL ограничен (секунды–минуты),
 * при недоступности auth-service валидный кэш продолжает работать до TTL.
 *
 * Точечной инвалидации нет намеренно: ключ записи включает project-суффикс,
 * который на стороне отзыва неизвестен. Единственный механизм инвалидации —
 * полный flush по сигналу auth-service (`POST /internal/cache-bust`).
 */
class CachedIntrospector implements Introspector
{
    public function __construct(
        private readonly AuthClient $client,
        private readonly Cache $cache,
        private readonly int $ttlSeconds = 90,
    ) {}

    public function token(string $bearerToken, ?string $project = null): IntrospectionResult
    {
        $key = 'tok:'.hash('sha256', $bearerToken.'|'.($project ?? ''));

        return $this->remember($key, fn () => $this->client->introspectToken($bearerToken, $project));
    }

    public function apiKey(string $apiKey): IntrospectionResult
    {
        return $this->remember('key:'.hash('sha256', $apiKey), fn () => $this->client->introspectApiKey($apiKey));
    }

    /** @param callable(): IntrospectionResult $resolve */
    private function remember(string $key, callable $resolve): IntrospectionResult
    {
        $cacheKey = 'introspect:'.$key;

        $cached = $this->cache->get($cacheKey);
        if (is_array($cached)) {
            return IntrospectionResult::fromArray($cached);
        }

        $result = $resolve();

        // Кэшируем и валидный, и невалидный результат: невалидный — коротко,
        // чтобы не долбить auth-service перебором ключей.
        $ttl = $result->active ? $this->ttlSeconds : min(15, $this->ttlSeconds);
        $this->cache->put($cacheKey, $result->toArray(), $ttl);

        return $result;
    }
}
