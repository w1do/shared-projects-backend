<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\ResetSitePasswordCommand;
use Cms\Auth\Application\Exceptions\AuthRuleViolation;
use Cms\Auth\Domain\Enums\Guard;
use Cms\Auth\Domain\Models\User;
use Cms\Auth\Infrastructure\Persistence\PasswordResetTokens;
use Cms\Shared\Analytics\Analytics;
use Illuminate\Support\Facades\Hash;

final class ResetSitePasswordHandler
{
    public function __construct(private readonly PasswordResetTokens $tokens) {}

    public function handle(ResetSitePasswordCommand $command): void
    {
        if (! $this->tokens->matches($command->data->email, Guard::Web, $command->projectId, $command->data->token)) {
            throw AuthRuleViolation::resetTokenInvalid();
        }

        /** @var User $user */
        $user = User::acrossProjects()
            ->where('project_id', $command->projectId)
            ->where('email', $command->data->email)
            ->firstOrFail();

        $user->forceFill(['password' => Hash::make($command->data->password)])->save();

        $this->tokens->forget($command->data->email, Guard::Web, $command->projectId);
        $user->tokens()->delete();

        Analytics::push($user->subjectKey(), ['name' => 'user.password_reset'], $command->projectId);
    }
}
