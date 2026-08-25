<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\DeleteRoleCommand;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Infrastructure\Notifications\DownstreamNotifier;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;

final class DeleteRoleHandler
{
    public function __construct(
        private readonly AuditRecorder $audit,
        private readonly DownstreamNotifier $downstream,
    ) {}

    public function handle(DeleteRoleCommand $command): void
    {
        $this->audit->record(AuditAction::RoleDeleted, $command->project->id, "role:{$command->role->name}");
        $command->role->delete();

        BootstrapCache::bump();
        $this->downstream->cacheBust(['reason' => 'roles_changed', 'project_id' => $command->project->id]);
    }
}
