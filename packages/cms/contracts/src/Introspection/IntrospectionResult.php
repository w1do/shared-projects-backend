<?php

declare(strict_types=1);

namespace Cms\Contracts\Introspection;

/**
 * Ответ auth-service на introspection токена или API-ключа.
 * Единственный источник правды для авторизации downstream-сервисов.
 */
final readonly class IntrospectionResult
{
    /**
     * @param  list<string>  $permissions  права оператора в проекте (subject=admin)
     * @param  list<string>  $scopes  scopes API-ключа (subject=api_key)
     * @param  list<string>  $enabledServices  сервисы, включённые для проекта
     * @param  list<string>  $locales  локали проекта; первая — локаль по умолчанию
     */
    public function __construct(
        public Subject $subject,
        public bool $active,
        public ?string $projectId = null,
        public ?string $userId = null,
        public bool $superAdmin = false,
        public array $permissions = [],
        public ?string $keyType = null,
        public array $scopes = [],
        public array $enabledServices = [],
        public array $locales = [],
    ) {}

    public static function invalid(): self
    {
        return new self(subject: Subject::Invalid, active: false);
    }

    public function can(string $permission): bool
    {
        return $this->superAdmin || in_array($permission, $this->permissions, true);
    }

    public function serviceEnabled(string $service): bool
    {
        return in_array($service, $this->enabledServices, true);
    }

    public function toArray(): array
    {
        return [
            'subject' => $this->subject->value,
            'active' => $this->active,
            'project_id' => $this->projectId,
            'user_id' => $this->userId,
            'super_admin' => $this->superAdmin,
            'permissions' => $this->permissions,
            'key_type' => $this->keyType,
            'scopes' => $this->scopes,
            'enabled_services' => $this->enabledServices,
            'locales' => $this->locales,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            subject: Subject::from($data['subject'] ?? 'invalid'),
            active: (bool) ($data['active'] ?? false),
            projectId: $data['project_id'] ?? null,
            userId: $data['user_id'] ?? null,
            superAdmin: (bool) ($data['super_admin'] ?? false),
            permissions: $data['permissions'] ?? [],
            keyType: $data['key_type'] ?? null,
            scopes: $data['scopes'] ?? [],
            enabledServices: $data['enabled_services'] ?? [],
            locales: $data['locales'] ?? [],
        );
    }
}
