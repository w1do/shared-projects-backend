<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\AssignMemberRoleCommand;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Infrastructure\Notifications\DownstreamNotifier;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;

/** Роль проверена на принадлежность проекту в `AssignRoleRequest`. */
final class AssignMemberRoleHandler
{
    public function __construct(
        private readonly AuditRecorder $audit,
        private readonly DownstreamNotifier $downstream,
    ) {}

    public function handle(AssignMemberRoleCommand $command): void
    {
        $command->member->syncRoles([$command->role]);

        $this->audit->record(AuditAction::MemberRoleChanged, $command->project->id, "admin:{$command->member->id}", ['role' => $command->role]);
        BootstrapCache::bump();
        $this->downstream->cacheBust(['reason' => 'roles_changed', 'project_id' => $command->project->id]);
    }
}
