<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Application\DTOs\Bootstrap\ServiceNavigationDTO;
use Cms\Auth\Domain\Models\ServiceManifestRecord;
use Cms\Auth\Domain\ValueObjects\PermissionSet;
use Cms\Contracts\Manifest\NavigationItem;
use Cms\Contracts\Manifest\ServiceManifest;
use Cms\Contracts\Manifest\SettingDefinition;

/**
 * Навигация и схемы настроек включённых сервисов проекта.
 *
 * Извлечено из сборки bootstrap: чтение манифестов, отсев выключенных сервисов
 * и фильтрация пунктов по правам были одним циклом внутри 103-строчного класса.
 * Само правило видимости живёт в `PermissionSet::allows()`.
 */
final class ServiceNavigationQuery
{
    /**
     * @param  list<string>  $enabledServices  ключи включённых на проекте сервисов
     * @return list<ServiceNavigationDTO>
     */
    public function handle(array $enabledServices, PermissionSet $permissions): array
    {
        $services = [];

        foreach (ServiceManifestRecord::query()->get() as $record) {
            $manifest = ServiceManifest::fromArray((array) $record->manifest);

            // Выключенный сервис в bootstrap не показываем вообще
            if (! in_array($manifest->key, $enabledServices, true)) {
                continue;
            }

            $services[] = new ServiceNavigationDTO(
                key: $manifest->key,
                version: $manifest->version,
                enabled: true,
                navigation: $this->visibleNavigation($manifest, $permissions),
                settings_schema: array_map(fn (SettingDefinition $s) => $s->toArray(), $manifest->settings),
            );
        }

        return $services;
    }

    /** @return list<array<string, mixed>> */
    private function visibleNavigation(ServiceManifest $manifest, PermissionSet $permissions): array
    {
        return array_values(array_filter(
            array_map(fn (NavigationItem $n) => $n->toArray(), $manifest->navigation),
            fn (array $item) => $permissions->allows($item['permission']),
        ));
    }
}
