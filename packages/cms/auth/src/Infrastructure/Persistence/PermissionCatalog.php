<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Persistence;

use Cms\Auth\Domain\Enums\Guard;
use Cms\Contracts\Manifest\ServiceManifest;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

/**
 * Каталог прав платформы. Права происходят только из манифестов сервисов —
 * вручную их не заводят, поэтому единственная операция здесь — upsert из манифеста.
 */
final class PermissionCatalog
{
    public function __construct(private readonly PermissionRegistrar $registrar) {}

    public function upsert(ServiceManifest $manifest): void
    {
        foreach ($manifest->permissions as $definition) {
            Permission::query()->updateOrCreate(
                ['name' => $definition->key, 'guard_name' => Guard::Admin->value],
                ['label' => $definition->label, 'group' => $definition->group],
            );
        }

        // И10: сброс до раскрытия шаблонов ролей — раскрытие читает права через
        // кэш spatie, и без сброса свежесозданное право «не существует».
        $this->registrar->forgetCachedPermissions();
    }
}
