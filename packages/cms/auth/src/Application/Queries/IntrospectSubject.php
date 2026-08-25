<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Auth\Domain\Models\User;
use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Introspection\Subject;
use Laravel\Sanctum\PersonalAccessToken;
use Spatie\Permission\PermissionRegistrar;

/**
 * Единая точка introspection для downstream-сервисов:
 * операторский токен / токен пользователя сайта / API-ключ проекта.
 */
final class IntrospectSubject
{
    public function __construct(private readonly PermissionRegistrar $registrar) {}

    public function token(string $plainToken, ?string $projectId = null): IntrospectionResult
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
            if ($owner->isBlocked()) {
                return IntrospectionResult::invalid();
            }

            return new IntrospectionResult(
                subject: Subject::ProjectUser,
                active: true,
                projectId: $owner->project_id,
                userId: (string) $owner->id,
                enabledServices: $this->enabledServices($owner->project_id),
                locales: $this->projectLocales($owner->project_id),
            );
        }

        return IntrospectionResult::invalid();
    }

    public function apiKey(string $plainKey): IntrospectionResult
    {
        $key = ProjectApiKey::findByPlainKey($plainKey);
        if ($key === null || $key->isRevoked() || $key->project?->isArchived()) {
            return IntrospectionResult::invalid();
        }

        $key->forceFill(['last_used_at' => now()])->saveQuietly();

        return new IntrospectionResult(
            subject: Subject::ApiKey,
            active: true,
            projectId: $key->project_id,
            keyType: $key->type,
            scopes: $key->scopes ?? [],
            enabledServices: $this->enabledServices($key->project_id),
            locales: $this->projectLocales($key->project_id),
        );
    }

    private function adminResult(Admin $admin, ?string $projectId): IntrospectionResult
    {
        $permissions = [];
        $superAdmin = $admin->isSuperAdmin();

        if ($projectId !== null) {
            $project = Project::query()->whereKey($projectId)->orWhere('key', $projectId)->first();
            if ($project === null || (! $superAdmin && ! $project->hasMember($admin))) {
                // Оператор без членства: активен, но прав и проекта нет
                return new IntrospectionResult(subject: Subject::Admin, active: true, userId: (string) $admin->id, superAdmin: $superAdmin);
            }
            $projectId = $project->id;

            if (! $superAdmin) {
                $previous = $this->registrar->getPermissionsTeamId();
                $this->registrar->setPermissionsTeamId($project->id);
                try {
                    $permissions = array_values(array_map('strval', $admin->getAllPermissions()->pluck('name')->all()));
                } finally {
                    $this->registrar->setPermissionsTeamId($previous);
                }
            }
        }

        return new IntrospectionResult(
            subject: Subject::Admin,
            active: true,
            projectId: $projectId,
            userId: (string) $admin->id,
            superAdmin: $superAdmin,
            permissions: $permissions,
            enabledServices: $projectId !== null ? $this->enabledServices($projectId) : [],
            locales: $projectId !== null ? $this->projectLocales($projectId) : [],
        );
    }

    /** @return list<string> */
    private function enabledServices(string $projectId): array
    {
        $project = Project::query()->find($projectId);

        return $project instanceof Project ? $project->enabledServices() : [];
    }

    /** @return list<string> локали проекта; первая — локаль по умолчанию */
    private function projectLocales(string $projectId): array
    {
        $project = Project::query()->find($projectId);

        return $project instanceof Project ? array_values(array_map('strval', $project->locales ?? [])) : [];
    }
}
