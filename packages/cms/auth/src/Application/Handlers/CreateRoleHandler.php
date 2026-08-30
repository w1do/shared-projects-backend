<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\CreateRoleCommand;
use Cms\Auth\Application\Exceptions\AuthRuleViolation;
use Cms\Auth\Application\Queries\ProjectRoleExistsQuery;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Enums\Guard;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;
use Spatie\Permission\Models\Role;

final class CreateRoleHandler
{
    public function __construct(
        private readonly AuditRecorder $audit,
        private readonly ProjectRoleExistsQuery $roles,
    ) {}

    public function handle(CreateRoleCommand $command): Role
    {
        if (array_key_exists($command->data->name, config('cms-auth.system_roles', []))) {
            throw AuthRuleViolation::roleNameReserved();
        }

        if ($this->roles->handle($command->project, $command->data->name)) {
            throw AuthRuleViolation::roleNameTaken();
        }

        $role = Role::query()->create(['name' => $command->data->name, 'guard_name' => Guard::Admin->value, 'project_id' => $command->project->id]);
        $role->syncPermissions($command->data->permissions);

        $this->audit->record(AuditAction::RoleCreated, $command->project->id, "role:{$role->name}", ['permissions' => $command->data->permissions]);
        BootstrapCache::bump();

        $fresh = $role->fresh('permissions');

        return $fresh ?? $role;
    }
}
