<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ServiceManifestRecord;
use Cms\Auth\Infrastructure\Support\BootstrapCache;
use Cms\Contracts\Manifest\ServiceManifest;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\PermissionRegistrar;

/**
 * GET /api/admin/v1/bootstrap: один запрос полностью описывает консоль.
 * Кэш в Redis, версия сбрасывается при регистрации манифестов и смене ролей.
 */
final class BuildBootstrap
{
    public function __construct(private readonly PermissionRegistrar $registrar) {}

    public function handle(Admin $admin, ?string $currentProjectKey = null): array
    {
        $cacheKey = BootstrapCache::key($admin->id, $currentProjectKey);

        return Cache::remember($cacheKey, 300, fn () => $this->build($admin, $currentProjectKey));
    }

    private function build(Admin $admin, ?string $currentProjectKey): array
    {
        $projects = $admin->isSuperAdmin()
            ? Project::query()->whereNull('archived_at')->get()
            : $admin->belongsToMany(Project::class, 'project_members', 'admin_id', 'project_id')
                ->whereNull('archived_at')->get();

        $current = $currentProjectKey !== null
            ? $projects->first(fn (Project $p) => $p->key === $currentProjectKey || $p->id === $currentProjectKey)
            : $projects->first();

        $permissions = [];
        $services = [];

        if ($current !== null) {
            $enabled = $current->enabledServices();

            if ($admin->isSuperAdmin()) {
                $permissions = ['*'];
            } else {
                $previous = $this->registrar->getPermissionsTeamId();
                $this->registrar->setPermissionsTeamId($current->id);
                try {
                    $permissions = $admin->getAllPermissions()->pluck('name')->values()->all();
                } finally {
                    $this->registrar->setPermissionsTeamId($previous);
                }
            }

            foreach (ServiceManifestRecord::query()->get() as $record) {
                $manifest = ServiceManifest::fromArray((array) $record->manifest);
                $isEnabled = in_array($manifest->key, $enabled, true);

                // Выключенный сервис в bootstrap не показываем вообще
                if (! $isEnabled) {
                    continue;
                }

                $navigation = array_values(array_filter(
                    array_map(fn ($n) => $n->toArray(), $manifest->navigation),
                    fn (array $item) => $item['permission'] === null
                        || $permissions === ['*']
                        || in_array($item['permission'], $permissions, true),
                ));

                $services[] = [
                    'key' => $manifest->key,
                    'version' => $manifest->version,
                    'enabled' => true,
                    'navigation' => $navigation,
                    'settings_schema' => array_map(fn ($s) => $s->toArray(), $manifest->settings),
                ];
            }
        }

        return [
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'locale' => $admin->locale,
                'is_super_admin' => $admin->isSuperAdmin(),
            ],
            'projects' => $projects->map(fn (Project $p) => [
                'id' => $p->id, 'key' => $p->key, 'name' => $p->name, 'locales' => $p->locales,
            ])->values()->all(),
            'current_project' => $current?->key,
            'services' => $services,
            'permissions' => $permissions,
            'translations_version' => (string) Cache::get('translations:version:'.($current?->id ?? ''), 1),
            'server_time' => now()->toIso8601String(),
        ];
    }
}
