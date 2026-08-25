<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Middleware;

use Closure;
use Cms\Auth\Domain\Models\Admin;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Каждый раздел закрыт правом: маршрутов без проверки права не существует. */
final class RequirePermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        /** @var Admin|null $admin */
        $admin = $request->user('admin');

        if ($admin === null) {
            return ErrorEnvelope::unauthorized();
        }

        // Отзыв роли действует со следующего запроса: relation не должна
        // пережить смену ролей (кэш guard'а между запросами / Octane).
        $admin->unsetRelation('roles');

        if (! $admin->isSuperAdmin() && ! $admin->hasPermissionTo($permission)) {
            return ErrorEnvelope::forbidden();
        }

        return $next($request);
    }
}
