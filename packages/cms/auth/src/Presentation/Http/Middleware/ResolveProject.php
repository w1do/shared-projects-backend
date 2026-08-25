<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Middleware;

use Closure;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Shared\Http\ErrorEnvelope;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

/**
 * Разбирает {project} из маршрута, проверяет членство (404 не-участнику),
 * устанавливает ProjectContext и team-контекст spatie на время запроса.
 */
final class ResolveProject
{
    public function __construct(
        private readonly ProjectContext $context,
        private readonly PermissionRegistrar $registrar,
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
            return ErrorEnvelope::notFound();
        }

        if (! $admin->isSuperAdmin() && ! $project->hasMember($admin)) {
            return ErrorEnvelope::notFound(); // существование проекта не раскрываем
        }

        $this->context->set($project->id);
        $this->registrar->setPermissionsTeamId($project->id);
        $request->attributes->set('project', $project);

        try {
            return $next($request);
        } finally {
            // Octane: team-контекст не должен пережить запрос
            $this->registrar->setPermissionsTeamId(null);
        }
    }
}
