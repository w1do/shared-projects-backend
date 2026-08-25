<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Persistence;

use Cms\Auth\Domain\Enums\Guard;
use Cms\Auth\Domain\Enums\SystemRole;
use Cms\Auth\Domain\Models\Project;
use Illuminate\Contracts\Config\Repository as Config;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/** Пере-раскрытие wildcard-шаблонов системных ролей по одному проекту. */
final class SystemRoleSyncer
{
    public function __construct(
        private readonly PermissionRegistrar $registrar,
        private readonly AdminPermissionResolver $permissions,
        private readonly Config $config,
    ) {}

    public function sync(Project $project): void
    {
        try {
            $this->permissions->withTeam($project->id, function () use ($project): void {
                $allPermissions = Permission::query()->where('guard_name', Guard::Admin->value)->pluck('name');

                /** @var array<string, list<string>> $templates */
                $templates = (array) $this->config->get('cms-auth.system_roles', []);

                foreach ($templates as $roleName => $patterns) {
                    if ($roleName === SystemRole::SuperAdmin->value) {
                        continue; // глобальная роль, не на проект
                    }

                    $role = Role::query()->firstOrCreate([
                        'name' => $roleName,
                        'guard_name' => Guard::Admin->value,
                        'project_id' => $project->id,
                    ]);

                    $matched = $allPermissions
                        ->filter(fn (string $p) => self::matchesAny($p, $patterns))
                        ->values()
                        ->all();

                    $role->syncPermissions($matched);
                }
            });
        } finally {
            // И10: порядок сохранён — сначала восстановление team-контекста
            // (finally резолвера), затем сброс кэша прав. Цикл ролей может быть
            // пуст, и тогда это единственный инвалидатор кэша.
            $this->registrar->forgetCachedPermissions();
        }
    }

    /** @param  list<string>  $patterns  шаблоны вида "*", "content.*", "*.view" */
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
