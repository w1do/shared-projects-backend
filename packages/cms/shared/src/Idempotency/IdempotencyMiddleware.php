<?php

declare(strict_types=1);

namespace Cms\Shared\Idempotency;

use Closure;
use Cms\Shared\Http\ErrorEnvelope;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Contracts\Cache\Repository as Cache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Idempotency-Key для мутирующих public-запросов: повтор с тем же ключом
 * возвращает сохранённый ответ первого выполнения без повторного побочного эффекта.
 */
final class IdempotencyMiddleware
{
    public const HEADER = 'Idempotency-Key';

    public function __construct(
        private readonly Cache $cache,
        private readonly ProjectContext $context,
        private readonly int $ttlSeconds = 86400,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return $next($request);
        }

        $key = $request->header(self::HEADER);
        if (! is_string($key) || $key === '') {
            return $next($request);
        }

        if (strlen($key) > 128) {
            return ErrorEnvelope::respond('invalid_idempotency_key', 'Idempotency-Key is too long.', 422);
        }

        $cacheKey = sprintf(
            'idem:%s:%s:%s',
            $this->context->id() ?? 'global',
            $request->method().':'.$request->path(),
            hash('sha256', $key),
        );

        $stored = $this->cache->get($cacheKey);
        if (is_array($stored)) {
            return new JsonResponse($stored['body'], $stored['status'], ['X-Idempotent-Replay' => 'true']);
        }

        $response = $next($request);

        if ($response instanceof JsonResponse && $response->getStatusCode() < 500) {
            $this->cache->put($cacheKey, [
                'status' => $response->getStatusCode(),
                'body' => $response->getData(true),
            ], $this->ttlSeconds);
        }

        return $response;
    }
}
