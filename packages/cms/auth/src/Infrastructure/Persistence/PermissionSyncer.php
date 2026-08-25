<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Support;

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Contracts\Manifest\ServiceManifest;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Права происходят только из манифестов сервисов: upsert в таблицы spatie
 * и пере-раскрытие wildcard-шаблонов системных ролей по каждому проекту.
 */
final class PermissionSyncer
{
    public function sync(ServiceManifest $manifest): void
    {
        foreach ($manifest->permissions as $definition) {
            Permission::query()->updateOrCreate(
                ['name' => $definition->key, 'guard_name' => 'admin'],
                ['label' => $definition->label, 'group' => $definition->group],
            );
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Project::query()->each(fn (Project $project) => $this->syncSystemRoles($project));
    }

    /** Создаёт/обновляет системные роли проекта по шаблонам из config. */
    public function syncSystemRoles(Project $project): void
    {
        $registrar = app(PermissionRegistrar::class);
        $previousTeam = $registrar->getPermissionsTeamId();
        $registrar->setPermissionsTeamId($project->id);

        try {
            $allPermissions = Permission::query()->where('guard_name', 'admin')->pluck('name');

            foreach (config('cms-auth.system_roles', []) as $roleName => $patterns) {
                if ($roleName === 'super-admin') {
                    continue; // глобальная роль, не на проект
                }

                $role = Role::query()->firstOrCreate([
                    'name' => $roleName,
                    'guard_name' => 'admin',
                    'project_id' => $project->id,
                ]);

                $matched = $allPermissions
                    ->filter(fn (string $p) => self::matchesAny($p, $patterns))
                    ->values()
                    ->all();

                $role->syncPermissions($matched);
            }
        } finally {
            $registrar->setPermissionsTeamId($previousTeam);
            $registrar->forgetCachedPermissions();
        }
    }

    public static function ensureGlobalSuperAdminRole(): Role
    {
        return Role::query()->firstOrCreate([
            'name' => 'super-admin',
            'guard_name' => 'admin',
            'project_id' => null,
        ]);
    }

    /** Выдаёт глобальную роль super-admin: pivot project_id = '' (вне teams-скоупа). */
    public static function grantSuperAdmin(Admin $admin): void
    {
        $role = self::ensureGlobalSuperAdminRole();

        DB::table('model_has_roles')->insertOrIgnore([
            'role_id' => $role->id,
            'model_type' => $admin::class,
            'model_id' => $admin->getKey(),
            'project_id' => '',
        ]);
    }

    /** @param list<string> $patterns шаблоны вида "*", "content.*", "*.view" */
    private static function matchesAny(string $permission, array $patterns): bool
    {
        foreach ($patterns as $pattern) {
            $regex = '/^'.str_replace('\*', '.*', preg_quote($pattern, '/')).'$/';
            if (preg_match($regex, $permission)) {
                return true;
            }
        }

        return false;
    }
}
