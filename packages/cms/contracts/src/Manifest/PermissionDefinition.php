<?php

declare(strict_types=1);

namespace Cms\Contracts\Manifest;

/** Право в формате <service>.<resource>.<action>. */
final readonly class PermissionDefinition
{
    public function __construct(
        public string $key,
        public string $label,
        public ?string $group = null,
    ) {}

    public function toArray(): array
    {
        return ['key' => $this->key, 'label' => $this->label, 'group' => $this->group];
    }

    public static function fromArray(array $data): self
    {
        return new self($data['key'], $data['label'], $data['group'] ?? null);
    }
}
