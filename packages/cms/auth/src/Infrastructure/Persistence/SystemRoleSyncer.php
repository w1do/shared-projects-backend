<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Persistence;

use Cms\Auth\Domain\Enums\Guard;
use Cms\Auth\Domain\Enums\SystemRole;
use Cms\Auth\Domain\Models\Project;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Support\Facades\Cache;
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

    /**
     * Пере-раскрытие идёт двумя путями: фоновой задачей публикации манифеста и
     * командой `permissions:sync`. Блокировка на проект обязательна — параллельный
     * `syncPermissions()` одной роли падает на дубле в `role_has_permissions`.
     *
     * @return int число системных ролей, пересобранных на проекте
     */
    public function sync(Project $project): int
    {
        try {
            // Владелец блокировки — pid, а не случайная строка: Str::random()
            // здесь сдвинул бы последовательность, на которую опираются снимки.
            $lock = Cache::lock("system-roles:{$project->id}", 30, (string) getmypid());

            return $lock->block(15, fn (): int => $this->expand($project));
        } finally {
            // И10: порядок сохранён — сначала восстановление team-контекста
            // (finally резолвера), затем сброс кэша прав. Цикл ролей может быть
            // пуст, и тогда это единственный инвалидатор кэша.
            $this->registrar->forgetCachedPermissions();
        }
    }

    private function expand(Project $project): int
    {
        return $this->permissions->withTeam($project->id, function () use ($project): int {
            $allPermissions = Permission::query()->where('guard_name', Guard::Admin->value)->pluck('name');

            /** @var array<string, list<string>> $templates */
            $templates = (array) $this->config->get('cms-auth.system_roles', []);
            $synced = 0;

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
                $synced++;
            }

            return $synced;
        });
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
