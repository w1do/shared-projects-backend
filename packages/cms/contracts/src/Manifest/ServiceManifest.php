<?php

declare(strict_types=1);

namespace Cms\Contracts\Manifest;

/**
 * Декларация сервиса, регистрируемая в auth-service.
 * Из неё собираются права, навигация и схемы настроек bootstrap-манифеста.
 */
final readonly class ServiceManifest
{
    /**
     * @param  list<PermissionDefinition>  $permissions
     * @param  list<NavigationItem>  $navigation
     * @param  list<SettingDefinition>  $settings
     */
    public function __construct(
        public string $key,
        public string $version,
        public array $permissions = [],
        public array $navigation = [],
        public array $settings = [],
    ) {}

    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'version' => $this->version,
            'permissions' => array_map(fn (PermissionDefinition $p) => $p->toArray(), $this->permissions),
            'navigation' => array_map(fn (NavigationItem $n) => $n->toArray(), $this->navigation),
            'settings' => array_map(fn (SettingDefinition $s) => $s->toArray(), $this->settings),
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            key: $data['key'],
            version: $data['version'],
            permissions: array_values(array_map(PermissionDefinition::fromArray(...), $data['permissions'] ?? [])),
            navigation: array_values(array_map(NavigationItem::fromArray(...), $data['navigation'] ?? [])),
            settings: array_values(array_map(SettingDefinition::fromArray(...), $data['settings'] ?? [])),
        );
    }
}
