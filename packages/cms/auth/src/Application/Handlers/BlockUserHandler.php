<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\BlockUserCommand;
use Cms\Auth\Domain\Models\User;
use Cms\Auth\Infrastructure\Support\Audit;
use Cms\Shared\Analytics\Analytics;

final class BlockUserHandler
{
    public function handle(BlockUserCommand $command): User
    {
        $command->user->forceFill(['blocked_at' => $command->blocked ? now() : null])->save();

        if ($command->blocked) {
            $command->user->tokens()->delete(); // блокировка инвалидирует токены
            Analytics::push($command->user->subjectKey(), ['name' => 'user.blocked'], $command->user->project_id);
        }

        Audit::record($command->blocked ? 'user.blocked' : 'user.unblocked', $command->user->project_id, "user:{$command->user->id}");

        return $command->user;
    }
}
