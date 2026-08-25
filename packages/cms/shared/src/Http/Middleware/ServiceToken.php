<?php

declare(strict_types=1);

namespace Cms\Shared\Http\Middleware;

use Closure;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * /internal/* принимает только сервисные вызовы: Authorization: Service <token>.
 *
 * Живёт в shared, чтобы internal-маршруты любого сервиса закрывались одним классом
 * (пакеты content/analytics/pay не видят Cms\Auth\* — Safety Protocol, И15).
 */
final class ServiceToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $header = (string) $request->header('Authorization', '');
        $expected = (string) config('cms.service_token');

        if ($expected === '' || ! hash_equals('Service '.$expected, $header)) {
            return ErrorEnvelope::unauthorized('Service token required.');
        }

        return $next($request);
    }
}
