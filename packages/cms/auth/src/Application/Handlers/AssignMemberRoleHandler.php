<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\AssignMemberRoleCommand;
use Cms\Auth\Infrastructure\Support\Audit;
use Cms\Auth\Infrastructure\Support\BootstrapCache;
use Cms\Auth\Infrastructure\Support\DownstreamNotifier;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

final class AssignMemberRoleHandler
{
    public function handle(AssignMemberRoleCommand $command): void
    {
        if (! Role::query()->where('project_id', $command->project->id)->where('name', $command->role)->exists()) {
            throw ValidationException::withMessages(['role' => ['Unknown role for this project.']]);
        }

        $command->member->syncRoles([$command->role]);

        Audit::record('member.role_changed', $command->project->id, "admin:{$command->member->id}", ['role' => $command->role]);
        BootstrapCache::bump();
        DownstreamNotifier::cacheBust(['reason' => 'roles_changed', 'project_id' => $command->project->id]);
    }
}
