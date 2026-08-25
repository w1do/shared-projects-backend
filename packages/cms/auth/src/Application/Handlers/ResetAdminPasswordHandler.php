<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\ResetAdminPasswordCommand;
use Cms\Auth\Application\Exceptions\AuthRuleViolation;
use Cms\Auth\Domain\Enums\Guard;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Infrastructure\Persistence\PasswordResetTokens;
use Illuminate\Support\Facades\Hash;

final class ResetAdminPasswordHandler
{
    public function __construct(private readonly PasswordResetTokens $tokens) {}

    public function handle(ResetAdminPasswordCommand $command): void
    {
        if (! $this->tokens->matches($command->data->email, Guard::Admin, null, $command->data->token)) {
            throw AuthRuleViolation::resetTokenInvalid();
        }

        /** @var Admin $admin */
        $admin = Admin::query()->where('email', $command->data->email)->firstOrFail();
        $admin->forceFill(['password' => Hash::make($command->data->password)])->save();

        // Одноразовость: токен удаляется, все выданные токены доступа инвалидируются
        $this->tokens->forget($command->data->email, Guard::Admin, null);
        $admin->tokens()->delete();
    }
}
