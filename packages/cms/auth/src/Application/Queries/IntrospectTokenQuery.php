<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Application\DTOs\Introspection\ProjectAccessDTO;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\User;
use Cms\Auth\Infrastructure\Persistence\AdminPermissionResolver;
use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Introspection\Subject;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Интроспекция токена доступа: операторский токен (guard admin) либо токен
 * пользователя сайта (guard web). Ключи проекта — отдельный запрос
 * (`IntrospectApiKeyQuery`): у них другой источник, другой субъект и другой
 * побочный эффект.
 */
final class IntrospectTokenQuery
{
    public function __construct(private readonly AdminPermissionResolver $permissions) {}

    public function handle(string $plainToken, ?string $projectId = null): IntrospectionResult
    {
        $accessToken = PersonalAccessToken::findToken($plainToken);
        if ($accessToken === null) {
            return IntrospectionResult::invalid();
        }

        $owner = $accessToken->tokenable;

        if ($owner instanceof Admin) {
            return $this->adminResult($owner, $projectId);
        }

        if ($owner instanceof User) {
            return $this->siteUserResult($owner);
        }

        return IntrospectionResult::invalid();
    }

    private function siteUserResult(User $user): IntrospectionResult
    {
        if ($user->isBlocked()) {
            return IntrospectionResult::invalid();
        }

        $access = ProjectAccessDTO::fromModel(Project::query()->find($user->project_id));

        return new IntrospectionResult(
            subject: Subject::ProjectUser,
            active: true,
            projectId: $user->project_id,
            userId: (string) $user->id,
            enabledServices: $access->enabledServices,
            locales: $access->locales,
        );
    }

    private function adminResult(Admin $admin, ?string $projectId): IntrospectionResult
    {
        $permissions = [];
        $superAdmin = $admin->isSuperAdmin();
        $access = ProjectAccessDTO::none();

        if ($projectId !== null) {
            $project = Project::query()->whereKey($projectId)->orWhere('key', $projectId)->first();
            if ($project === null || (! $superAdmin && ! $project->hasMember($admin))) {
                // Оператор без членства: активен, но прав и проекта нет
                return new IntrospectionResult(subject: Subject::Admin, active: true, userId: (string) $admin->id, superAdmin: $superAdmin);
            }
            $projectId = $project->id;

            if (! $superAdmin) {
                $permissions = $this->permissions->withTeam(
                    $project->id,
                    fn (): array => array_values(array_map('strval', $admin->getAllPermissions()->pluck('name')->all())),
                );
            }

            // Проект уже загружен — повторных запросов за теми же фактами нет
            $access = ProjectAccessDTO::fromModel($project);
        }

        return new IntrospectionResult(
            subject: Subject::Admin,
            active: true,
            projectId: $projectId,
            userId: (string) $admin->id,
            superAdmin: $superAdmin,
            permissions: $permissions,
            enabledServices: $access->enabledServices,
            locales: $access->locales,
        );
    }
}
