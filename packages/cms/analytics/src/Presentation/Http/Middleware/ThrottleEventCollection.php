<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Middleware;

use Closure;
use Cms\Shared\Http\ErrorEnvelope;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

/**
 * Лимит приёма событий: N событий в минуту на проект (ключ — из контекста проекта,
 * то есть из API-ключа сайта, а не из тела запроса).
 *
 * Порядок сохранён (снимок `analytics-collect-429-before-validation`): лимит
 * проверяется РАНЬШЕ разбора payload, попытка засчитывается и ботам тоже —
 * поэтому middleware стоит до фильтра ботов и до FormRequest.
 */
final class ThrottleEventCollection
{
    public function __construct(private readonly ProjectContext $context) {}

    public function handle(Request $request, Closure $next): Response
    {
        $limitKey = 'collect:'.$this->context->required();

        if (RateLimiter::tooManyAttempts($limitKey, (int) config('cms-analytics.collect_rate_limit', 600))) {
            return ErrorEnvelope::respond('too_many_events', 'Event rate limit exceeded.', 429);
        }

        RateLimiter::hit($limitKey, 60);

        return $next($request);
    }
}
