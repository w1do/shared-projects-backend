<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\CreateRoleCommand;
use Cms\Auth\Infrastructure\Support\Audit;
use Cms\Auth\Infrastructure\Support\BootstrapCache;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

final class CreateRoleHandler
{
    public function handle(CreateRoleCommand $command): Role
    {
        if (array_key_exists($command->data->name, config('cms-auth.system_roles', []))) {
            throw ValidationException::withMessages(['name' => ['This role name is reserved.']]);
        }

        $role = Role::query()->create(['name' => $command->data->name, 'guard_name' => 'admin', 'project_id' => $command->project->id]);
        $role->syncPermissions($command->data->permissions);

        Audit::record('role.created', $command->project->id, "role:{$role->name}", ['permissions' => $command->data->permissions]);
        BootstrapCache::bump();

        $fresh = $role->fresh('permissions');

        return $fresh ?? $role;
    }
}
