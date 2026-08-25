<?php

declare(strict_types=1);

namespace Cms\Shared\AuthClient\Middleware;

use Closure;
use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Выключенный для проекта сервис отвечает 404 (не 403 —
 * существование раздела не раскрывается). Параметр — key сервиса.
 */
final class EnsureServiceEnabled
{
    public function handle(Request $request, Closure $next, string $service): Response
    {
        $result = $request->attributes->get('introspection');

        if (! $result instanceof IntrospectionResult || ! $result->serviceEnabled($service)) {
            return ErrorEnvelope::notFound();
        }

        return $next($request);
    }
}
