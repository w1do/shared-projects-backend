<?php

declare(strict_types=1);

namespace Cms\Contracts\Manifest;

/** Схема одной настройки сервиса на проект. */
final readonly class SettingDefinition
{
    public function __construct(
        public string $key,
        public string $type,
        public string $label,
        public mixed $default = null,
        public array $rules = [],
        public bool $secret = false,
    ) {}

    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'type' => $this->type,
            'label' => $this->label,
            'default' => $this->default,
            'rules' => $this->rules,
            'secret' => $this->secret,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            key: $data['key'],
            type: $data['type'],
            label: $data['label'],
            default: $data['default'] ?? null,
            rules: $data['rules'] ?? [],
            secret: $data['secret'] ?? false,
        );
    }
}
