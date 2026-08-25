<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\RemoveMemberCommand;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Infrastructure\Notifications\DownstreamNotifier;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;

final class RemoveMemberHandler
{
    public function __construct(
        private readonly AuditRecorder $audit,
        private readonly DownstreamNotifier $downstream,
    ) {}

    public function handle(RemoveMemberCommand $command): void
    {
        $command->member->syncRoles([]);
        $command->project->members()->detach($command->member->id);

        $this->audit->record(AuditAction::MemberRemoved, $command->project->id, "admin:{$command->member->id}");
        BootstrapCache::bump();
        $this->downstream->cacheBust(['reason' => 'member_changed', 'project_id' => $command->project->id]);
    }
}
