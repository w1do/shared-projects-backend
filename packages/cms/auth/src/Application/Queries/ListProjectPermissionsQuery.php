<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Application\DTOs\Permission\PermissionCatalogEntryDTO;
use Cms\Auth\Domain\Enums\Guard;
use Cms\Auth\Domain\Enums\ServiceName;
use Cms\Auth\Domain\Models\Project;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Permission;

/**
 * Каталог прав, доступных проекту: источник чекбоксов при сборке роли.
 * Права сервиса, выключенного на проекте, в каталог не попадают — роль из них
 * ничего бы не открыла. Состав уже существующей роли фильтр не урезает.
 */
final class ListProjectPermissionsQuery
{
    /** @return Collection<int, PermissionCatalogEntryDTO> */
    public function handle(Project $project): Collection
    {
        $enabled = $project->enabledServices();

        $rows = Permission::query()
            ->where('guard_name', Guard::Admin->value)
            ->orderBy('name')
            ->toBase()
            ->get(['name', 'label', 'group']);

        return $rows
            ->map(fn (object $row) => new PermissionCatalogEntryDTO(
                key: (string) $row->name,
                label: (string) ($row->label ?? $row->name),
                group: $row->group === null ? null : (string) $row->group,
                service: self::serviceOf((string) $row->name),
            ))
            ->filter(fn (PermissionCatalogEntryDTO $entry) => self::isAvailable($entry->service, $enabled))
            ->values();
    }

    /** Сервис права — префикс ключа: `content.posts.view` → `content`. */
    private static function serviceOf(string $permission): string
    {
        return explode('.', $permission)[0];
    }

    /** @param  list<string>  $enabled  включённые на проекте сервисы */
    private static function isAvailable(string $service, array $enabled): bool
    {
        $gate = ServiceName::tryFrom($service)?->gate()->value ?? $service;

        if (! in_array($gate, ServiceName::toggleable(), true)) {
            return true;
        }

        return in_array($gate, $enabled, true);
    }
}
