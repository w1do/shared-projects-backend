<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\DeleteUserCommand;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;

final class DeleteUserHandler
{
    public function __construct(
        private readonly AuditRecorder $audit,
    ) {}

    public function handle(DeleteUserCommand $command): void
    {
        $this->audit->record(AuditAction::UserDeleted, $command->user->project_id, "user:{$command->user->id}");
        $command->user->tokens()->delete();
        $command->user->delete();
    }
}
