<?php

declare(strict_types=1);

namespace Cms\Contracts\Manifest;

/** Пункт навигации админ-панели, декларируемый сервисом. */
final readonly class NavigationItem
{
    /** @param list<NavigationItem> $children */
    public function __construct(
        public string $key,
        public string $label,
        public string $route,
        public ?string $permission = null,
        public ?string $icon = null,
        public int $order = 0,
        public array $children = [],
    ) {}

    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'route' => $this->route,
            'permission' => $this->permission,
            'icon' => $this->icon,
            'order' => $this->order,
            'children' => array_map(fn (self $c) => $c->toArray(), $this->children),
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            key: $data['key'],
            label: $data['label'],
            route: $data['route'],
            permission: $data['permission'] ?? null,
            icon: $data['icon'] ?? null,
            order: $data['order'] ?? 0,
            children: array_values(array_map(self::fromArray(...), $data['children'] ?? [])),
        );
    }
}
