<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\DeleteUserCommand;
use Cms\Auth\Infrastructure\Support\Audit;

final class DeleteUserHandler
{
    public function handle(DeleteUserCommand $command): void
    {
        Audit::record('user.deleted', $command->user->project_id, "user:{$command->user->id}");
        $command->user->tokens()->delete();
        $command->user->delete();
    }
}
