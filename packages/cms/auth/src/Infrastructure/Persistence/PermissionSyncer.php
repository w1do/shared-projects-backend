<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Persistence;

use Cms\Auth\Domain\Enums\Guard;
use Cms\Auth\Domain\Enums\SystemRole;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Infrastructure\Jobs\SyncSystemRolesJob;
use Cms\Contracts\Manifest\ServiceManifest;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

/**
 * Права происходят только из манифестов сервисов.
 *
 * Класс остался входной точкой, но разошёлся на две ответственности:
 * каталог прав (`PermissionCatalog`) и раскрытие шаблонов системных ролей
 * (`SystemRoleSyncer`); проход по всем проектам уехал в `SyncSystemRolesJob`.
 */
final class PermissionSyncer
{
    public function __construct(
        private readonly PermissionCatalog $catalog,
        private readonly SystemRoleSyncer $roles,
    ) {}

    public function sync(ServiceManifest $manifest): void
    {
        $this->catalog->upsert($manifest);

        SyncSystemRolesJob::dispatch();
    }

    /** Создаёт/обновляет системные роли одного проекта по шаблонам из config. */
    public function syncSystemRoles(Project $project): void
    {
        $this->roles->sync($project);
    }

    public static function ensureGlobalSuperAdminRole(): Role
    {
        return Role::query()->firstOrCreate([
            'name' => SystemRole::SuperAdmin->value,
            'guard_name' => Guard::Admin->value,
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
}
