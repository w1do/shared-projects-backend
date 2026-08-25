<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\UpdateRolePermissionsCommand;
use Cms\Auth\Infrastructure\Support\Audit;
use Cms\Auth\Infrastructure\Support\BootstrapCache;
use Cms\Auth\Infrastructure\Support\DownstreamNotifier;
use Spatie\Permission\Models\Role;

final class UpdateRolePermissionsHandler
{
    public function handle(UpdateRolePermissionsCommand $command): Role
    {
        $command->role->syncPermissions($command->data->permissions);

        Audit::record('role.updated', $command->project->id, "role:{$command->role->name}", ['permissions' => $command->data->permissions]);
        BootstrapCache::bump();
        DownstreamNotifier::cacheBust(['reason' => 'roles_changed', 'project_id' => $command->project->id]);

        return $command->role->fresh('permissions') ?? $command->role;
    }
}
