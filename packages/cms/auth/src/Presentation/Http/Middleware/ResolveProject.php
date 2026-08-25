<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Middleware;

use Closure;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Infrastructure\Persistence\AdminPermissionResolver;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Разбирает {project} из маршрута, проверяет членство (404 не-участнику),
 * устанавливает ProjectContext и team-контекст spatie на время запроса.
 *
 * 404 отдаётся общим приёмом платформы — исключением, которое обработчик
 * приложения разворачивает в тот же конверт ошибки, что и остальные 404.
 */
final class ResolveProject
{
    public function __construct(
        private readonly ProjectContext $context,
        private readonly AdminPermissionResolver $permissions,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $projectParam = $request->route('project');
        $project = $projectParam instanceof Project
            ? $projectParam
            : Project::query()->whereKey($projectParam)->orWhere('key', $projectParam)->first();

        /** @var Admin|null $admin */
        $admin = $request->user('admin');

        if ($project === null || $admin === null) {
            throw new NotFoundHttpException;
        }

        if (! $admin->isSuperAdmin() && ! $project->hasMember($admin)) {
            throw new NotFoundHttpException; // существование проекта не раскрываем
        }

        $this->context->set($project->id);
        $request->attributes->set('project', $project);

        // Swap обязан пережить $next(): оборачивается весь конвейер запроса.
        // Octane: team-контекст не должен пережить запрос — отсюда сброс в null.
        return $this->permissions->withTeam($project->id, fn (): Response => $next($request));
    }
}
