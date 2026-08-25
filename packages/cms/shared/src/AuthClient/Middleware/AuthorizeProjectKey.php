<?php

declare(strict_types=1);

namespace Cms\Shared\AuthClient\Middleware;

use Closure;
use Cms\Contracts\Introspection\Subject;
use Cms\Shared\AuthClient\CachedIntrospector;
use Cms\Shared\Http\ErrorEnvelope;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Public-маршруты: аутентификация сайта проекта по API-ключу
 * (Authorization: Bearer pk_.../sk_... или X-Api-Key). Контекст проекта — из ключа.
 * Параметр — требуемый scope ключа.
 */
final class AuthorizeProjectKey
{
    public function __construct(
        private readonly CachedIntrospector $introspector,
        private readonly ProjectContext $context,
    ) {}

    public function handle(Request $request, Closure $next, ?string $scope = null): Response
    {
        $key = $request->header('X-Api-Key') ?? $request->bearerToken();
        if (! is_string($key) || $key === '') {
            return ErrorEnvelope::unauthorized('API key is required.');
        }

        $result = $this->introspector->apiKey($key);
        if (! $result->active || $result->subject !== Subject::ApiKey || $result->projectId === null) {
            return ErrorEnvelope::unauthorized('Invalid API key.');
        }

        if ($scope !== null && ! in_array($scope, $result->scopes, true)) {
            return ErrorEnvelope::forbidden('API key is missing the required scope.');
        }

        $this->context->set($result->projectId);
        $request->attributes->set('introspection', $result);

        return $next($request);
    }
}
