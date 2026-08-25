<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\UpdateRolePermissionsCommand;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Infrastructure\Notifications\DownstreamNotifier;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;
use Spatie\Permission\Models\Role;

final class UpdateRolePermissionsHandler
{
    public function __construct(
        private readonly AuditRecorder $audit,
        private readonly DownstreamNotifier $downstream,
    ) {}

    public function handle(UpdateRolePermissionsCommand $command): Role
    {
        $command->role->syncPermissions($command->data->permissions);

        $this->audit->record(AuditAction::RoleUpdated, $command->project->id, "role:{$command->role->name}", ['permissions' => $command->data->permissions]);
        BootstrapCache::bump();
        $this->downstream->cacheBust(['reason' => 'roles_changed', 'project_id' => $command->project->id]);

        return $command->role->fresh('permissions') ?? $command->role;
    }
}
