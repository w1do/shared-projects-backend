<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\BlockUserCommand;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Models\User;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Shared\Analytics\Analytics;

final class BlockUserHandler
{
    public function __construct(
        private readonly AuditRecorder $audit,
    ) {}

    public function handle(BlockUserCommand $command): User
    {
        $command->user->forceFill(['blocked_at' => $command->blocked ? now() : null])->save();

        if ($command->blocked) {
            $command->user->tokens()->delete(); // блокировка инвалидирует токены
            Analytics::push($command->user->subjectKey(), ['name' => 'user.blocked'], $command->user->project_id);
        }

        $this->audit->record($command->blocked ? AuditAction::UserBlocked : AuditAction::UserUnblocked, $command->user->project_id, "user:{$command->user->id}");

        return $command->user;
    }
}
