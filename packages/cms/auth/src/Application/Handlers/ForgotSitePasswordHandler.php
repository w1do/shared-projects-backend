<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\ForgotSitePasswordCommand;
use Cms\Auth\Domain\Enums\Guard;
use Cms\Auth\Domain\Models\User;
use Cms\Auth\Infrastructure\Persistence\AttemptThrottle;
use Cms\Auth\Infrastructure\Persistence\PasswordResetTokens;

final class ForgotSitePasswordHandler
{
    public function __construct(
        private readonly AttemptThrottle $throttle,
        private readonly PasswordResetTokens $tokens,
    ) {}

    public function handle(ForgotSitePasswordCommand $command): void
    {
        $throttleKey = "web-reset:{$command->projectId}:".strtolower($command->data->email);
        $this->throttle->ensureNotExceeded($throttleKey, 3);
        $this->throttle->hit($throttleKey, 300);

        $exists = User::acrossProjects()
            ->where('project_id', $command->projectId)
            ->where('email', $command->data->email)
            ->exists();

        if (! $exists) {
            return;
        }

        $this->tokens->issue($command->data->email, Guard::Web, $command->projectId);
    }
}
