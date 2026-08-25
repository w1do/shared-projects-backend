<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Role;

use Spatie\LaravelData\Data;
use Spatie\Permission\Models\Role;

final class RoleDTO extends Data
{
    /** @param list<string> $permissions */
    public function __construct(
        public int $id,
        public string $name,
        public bool $system,
        public array $permissions,
    ) {}

    public static function fromModel(Role $role): self
    {
        return new self(
            id: (int) $role->id,
            name: $role->name,
            system: array_key_exists($role->name, config('cms-auth.system_roles', [])),
            permissions: array_values(array_map('strval', $role->permissions->pluck('name')->all())),
        );
    }
}
