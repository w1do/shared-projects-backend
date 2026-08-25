<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\ForgotAdminPasswordCommand;
use Cms\Auth\Domain\Enums\Guard;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Infrastructure\Persistence\AttemptThrottle;
use Cms\Auth\Infrastructure\Persistence\PasswordResetTokens;

final class ForgotAdminPasswordHandler
{
    public function __construct(
        private readonly AttemptThrottle $throttle,
        private readonly PasswordResetTokens $tokens,
    ) {}

    public function handle(ForgotAdminPasswordCommand $command): void
    {
        $throttleKey = 'admin-reset:'.strtolower($command->data->email);
        $this->throttle->ensureNotExceeded($throttleKey, 3);
        $this->throttle->hit($throttleKey, 300);

        if (! Admin::query()->where('email', $command->data->email)->exists()) {
            return; // ответ одинаковый вне зависимости от существования аккаунта
        }

        // Admin-ветка: доставка токена — почтовым каналом окружения (нотификации), вне MVP-кода.
        $this->tokens->issue($command->data->email, Guard::Admin, null);
    }
}
