<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\Role\RolePermissionsDTO;
use Cms\Auth\Domain\Models\Project;
use Spatie\Permission\Models\Role;

/** Команда-намерение: данные для UpdateRolePermissionsHandler. */
final readonly class UpdateRolePermissionsCommand
{
    public function __construct(
        public Project $project,
        public Role $role,
        public RolePermissionsDTO $data,
    ) {}
}
