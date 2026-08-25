<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Middleware;

use Closure;
use Cms\Auth\Domain\Models\User;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Токен guard web действителен только с ключом того же проекта и только пока
 * пользователь не заблокирован.
 *
 * Раньше это был приватный `currentUser()` контроллера, вызываемый в трёх экшенах.
 * Проверка сделана middleware, а не Policy, сознательно: несоответствие проекту и
 * блокировка отвечают 401, а Policy может дать только 403 — код ответа менять нельзя.
 */
final class EnsureSiteUser
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user('web');
        $projectId = $request->attributes->get('project_id');

        if ($user === null || $user->isBlocked() || $user->project_id !== $projectId) {
            return ErrorEnvelope::unauthorized();
        }

        $request->attributes->set('site_user', $user);

        return $next($request);
    }
}
