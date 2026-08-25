<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\DeleteRoleCommand;
use Cms\Auth\Infrastructure\Support\Audit;
use Cms\Auth\Infrastructure\Support\BootstrapCache;
use Cms\Auth\Infrastructure\Support\DownstreamNotifier;

final class DeleteRoleHandler
{
    public function handle(DeleteRoleCommand $command): void
    {
        Audit::record('role.deleted', $command->project->id, "role:{$command->role->name}");
        $command->role->delete();

        BootstrapCache::bump();
        DownstreamNotifier::cacheBust(['reason' => 'roles_changed', 'project_id' => $command->project->id]);
    }
}
