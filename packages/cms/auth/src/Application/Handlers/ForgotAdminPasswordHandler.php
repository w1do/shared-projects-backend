<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\ForgotAdminPasswordCommand;
use Cms\Auth\Domain\Exceptions\TooManyAttempts;
use Cms\Auth\Domain\Models\Admin;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

final class ForgotAdminPasswordHandler
{
    public function handle(ForgotAdminPasswordCommand $command): void
    {
        $throttleKey = 'admin-reset:'.strtolower($command->data->email);
        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            throw new TooManyAttempts;
        }
        RateLimiter::hit($throttleKey, 300);

        if (! Admin::query()->where('email', $command->data->email)->exists()) {
            return; // ответ одинаковый вне зависимости от существования аккаунта
        }

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $command->data->email, 'guard' => 'admin'],
            ['token' => hash('sha256', Str::random(64)), 'created_at' => now(), 'project_id' => null],
        );
        // Доставка токена — почтовым каналом окружения (нотификации), вне MVP-кода.
    }
}
