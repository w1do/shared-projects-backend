<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\SyncPermissionsCommand;
use Cms\Auth\Application\DTOs\Permission\PermissionSyncSummaryDTO;
use Cms\Auth\Domain\Enums\Guard;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ServiceManifestRecord;
use Cms\Auth\Infrastructure\Notifications\DownstreamNotifier;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;
use Cms\Auth\Infrastructure\Persistence\PermissionCatalog;
use Cms\Auth\Infrastructure\Persistence\SystemRoleSyncer;
use Cms\Contracts\Manifest\ServiceManifest;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

/**
 * Приведение каталога прав и системных ролей всех проектов к опубликованным
 * манифестам. Источник истины — таблица `service_manifests`: код чужих пакетов
 * auth-service не видит, в проде сервисы стоят разными контейнерами.
 */
final class SyncPermissionsHandler
{
    public function __construct(
        private readonly PermissionCatalog $catalog,
        private readonly SystemRoleSyncer $roles,
        private readonly PermissionRegistrar $registrar,
        private readonly DownstreamNotifier $downstream,
    ) {}

    public function handle(SyncPermissionsCommand $command): PermissionSyncSummaryDTO
    {
        $known = $this->catalogSnapshot();
        $declared = [];
        $manifests = 0;
        $added = 0;
        $updated = 0;

        foreach (ServiceManifestRecord::query()->get() as $record) {
            $manifest = ServiceManifest::fromArray((array) $record->manifest);
            $manifests++;

            foreach ($manifest->permissions as $definition) {
                $declared[$definition->key] = true;

                if (! array_key_exists($definition->key, $known)) {
                    $added++;
                } elseif ($known[$definition->key] !== [$definition->label, $definition->group]) {
                    $updated++;
                }
            }

            $this->catalog->upsert($manifest);
        }

        $orphans = array_values(array_diff(array_keys($known), array_keys($declared)));

        if ($command->prune && $orphans !== []) {
            $this->prune($orphans);
        }

        $projects = 0;
        $rebuilt = 0;

        Project::query()->each(function (Project $project) use (&$projects, &$rebuilt): void {
            $projects++;
            $rebuilt += $this->roles->sync($project);
        });

        $this->registrar->forgetCachedPermissions();
        BootstrapCache::bump();
        $this->downstream->cacheBust(['reason' => 'permissions_synced']);

        return new PermissionSyncSummaryDTO(
            manifests: $manifests,
            added: $added,
            updated: $updated,
            projects: $projects,
            roles: $rebuilt,
            orphans: $orphans,
            pruned: $command->prune,
        );
    }

    /** @return array<string, array{0: mixed, 1: mixed}> имя права => [метка, группа] */
    private function catalogSnapshot(): array
    {
        $rows = Permission::query()
            ->where('guard_name', Guard::Admin->value)
            ->toBase()
            ->get(['name', 'label', 'group']);

        $snapshot = [];

        foreach ($rows as $row) {
            $snapshot[(string) $row->name] = [$row->label, $row->group];
        }

        return $snapshot;
    }

    /** @param  list<string>  $orphans */
    private function prune(array $orphans): void
    {
        Permission::query()
            ->where('guard_name', Guard::Admin->value)
            ->whereIn('name', $orphans)
            ->get()
            ->each(fn (Permission $permission) => $permission->delete());
    }
}
