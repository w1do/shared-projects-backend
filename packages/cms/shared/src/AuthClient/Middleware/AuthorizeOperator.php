<?php

declare(strict_types=1);

namespace Cms\Shared\AuthClient\Middleware;

use Closure;
use Cms\Contracts\Introspection\Subject;
use Cms\Shared\AuthClient\Introspector;
use Cms\Shared\Http\ErrorEnvelope;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Admin-маршруты downstream-сервиса: Bearer-токен оператора проверяется
 * через introspection auth-service; контекст проекта берётся из сегмента {project}.
 * Параметр middleware — требуемое право (например, content.posts.view).
 */
final class AuthorizeOperator
{
    public function __construct(
        private readonly Introspector $introspector,
        private readonly ProjectContext $context,
    ) {}

    public function handle(Request $request, Closure $next, ?string $permission = null): Response
    {
        $token = $request->bearerToken();
        if ($token === null) {
            return ErrorEnvelope::unauthorized();
        }

        $project = $request->route('project');
        if (! is_string($project) || $project === '') {
            return ErrorEnvelope::notFound();
        }

        $result = $this->introspector->token($token, $project);
        if (! $result->active || $result->subject !== Subject::Admin) {
            return ErrorEnvelope::unauthorized();
        }

        // Не-участнику существование проекта не раскрываем: 404, не 403.
        if (! $result->superAdmin && $result->projectId === null) {
            return ErrorEnvelope::notFound();
        }

        $project = $result->projectId ?? $project;

        if ($permission !== null && ! $result->can($permission)) {
            return ErrorEnvelope::forbidden();
        }

        $this->context->set($project);
        $request->attributes->set('introspection', $result);

        // Локаль запроса: ?locale из объявленных у проекта, иначе локаль
        // проекта по умолчанию (первая). Переводимые поля отвечают на ней.
        $requested = $request->query('locale');
        if (is_string($requested) && in_array($requested, $result->locales, true)) {
            app()->setLocale($requested);
        } elseif ($result->locales !== []) {
            app()->setLocale($result->locales[0]);
        }

        return $next($request);
    }
}
