<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\RemoveMemberCommand;
use Cms\Auth\Infrastructure\Support\Audit;
use Cms\Auth\Infrastructure\Support\BootstrapCache;
use Cms\Auth\Infrastructure\Support\DownstreamNotifier;

final class RemoveMemberHandler
{
    public function handle(RemoveMemberCommand $command): void
    {
        $command->member->syncRoles([]);
        $command->project->members()->detach($command->member->id);

        Audit::record('member.removed', $command->project->id, "admin:{$command->member->id}");
        BootstrapCache::bump();
        DownstreamNotifier::cacheBust(['reason' => 'member_changed', 'project_id' => $command->project->id]);
    }
}
