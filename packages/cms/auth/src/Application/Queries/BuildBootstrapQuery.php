<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Application\DTOs\Bootstrap\BootstrapDTO;
use Cms\Auth\Application\DTOs\Bootstrap\BootstrapProjectDTO;
use Cms\Auth\Application\DTOs\Bootstrap\BootstrapUserDTO;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\ValueObjects\PermissionSet;
use Cms\Auth\Infrastructure\Persistence\AdminPermissionResolver;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;
use Illuminate\Contracts\Cache\Repository as CacheRepository;
use Illuminate\Support\Collection;

/**
 * GET /api/admin/v1/bootstrap: один запрос полностью описывает консоль.
 * Кэш в Redis, версия сбрасывается при регистрации манифестов и смене ролей.
 *
 * В кэше лежит массив — ровно той же формы, что и до рефакторинга (И12):
 * DTO собирается из него и разворачивается обратно в него же, поэтому значения,
 * записанные предыдущим выкатом, читаются без смены ключа.
 */
final class BuildBootstrapQuery
{
    public function __construct(
        private readonly CacheRepository $cache,
        private readonly AdminPermissionResolver $permissions,
        private readonly ServiceNavigationQuery $services,
    ) {}

    public function handle(Admin $admin, ?string $currentProjectKey = null): BootstrapDTO
    {
        $cacheKey = BootstrapCache::key($admin->id, $currentProjectKey);

        /** @var array<string, mixed> $value */
        $value = $this->cache->remember(
            $cacheKey,
            300,
            fn (): array => $this->build($admin, $currentProjectKey)->toArray(),
        );

        return BootstrapDTO::fromCached($value);
    }

    private function build(Admin $admin, ?string $currentProjectKey): BootstrapDTO
    {
        $superAdmin = $admin->isSuperAdmin();
        $projects = $this->visibleProjects($admin, $superAdmin);
        $current = $this->currentProject($projects, $currentProjectKey);

        $permissions = new PermissionSet([]);
        $services = [];

        if ($current !== null) {
            $permissions = $this->permissionsIn($admin, $current, $superAdmin);
            $services = $this->services->handle($current->enabledServices(), $permissions);
        }

        return new BootstrapDTO(
            user: BootstrapUserDTO::fromModel($admin, $superAdmin),
            projects: array_values($projects->map(BootstrapProjectDTO::fromModel(...))->all()),
            current_project: $current?->key,
            services: $services,
            permissions: $permissions->permissions,
            translations_version: (string) $this->cache->get('translations:version:'.($current->id ?? ''), 1),
            server_time: now()->toIso8601String(),
        );
    }

    /** @return Collection<int, Project> */
    private function visibleProjects(Admin $admin, bool $superAdmin): Collection
    {
        if ($superAdmin) {
            return Project::query()->whereNull('archived_at')->get();
        }

        // Отношение вместо ручного belongsToMany() прямо в query
        return $admin->projects()->whereNull('archived_at')->get();
    }

    /** @param  Collection<int, Project>  $projects */
    private function currentProject(Collection $projects, ?string $currentProjectKey): ?Project
    {
        if ($currentProjectKey === null) {
            return $projects->first();
        }

        return $projects->first(fn (Project $p) => $p->key === $currentProjectKey || $p->id === $currentProjectKey);
    }

    private function permissionsIn(Admin $admin, Project $project, bool $superAdmin): PermissionSet
    {
        if ($superAdmin) {
            return PermissionSet::superAdmin();
        }

        return new PermissionSet($this->permissions->withTeam(
            $project->id,
            fn (): array => array_values(array_map('strval', $admin->getAllPermissions()->pluck('name')->all())),
        ));
    }
}
