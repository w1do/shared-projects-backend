<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\LoginAdminCommand;
use Cms\Auth\Domain\Exceptions\TooManyAttempts;
use Cms\Auth\Domain\Models\Admin;
use Cms\Shared\Analytics\Analytics;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

final class LoginAdminHandler
{
    /** @return array{admin: Admin, token: string} */
    public function handle(LoginAdminCommand $command): array
    {
        $throttleKey = 'admin-login:'.strtolower($command->data->email).'|'.$command->ip;
        if (RateLimiter::tooManyAttempts($throttleKey, (int) config('cms-auth.login_rate_limit', 5))) {
            throw new TooManyAttempts;
        }

        $admin = Admin::query()->where('email', $command->data->email)->first();

        if ($admin === null || ! Hash::check($command->data->password, $admin->password)) {
            RateLimiter::hit($throttleKey, 60);

            // Существование аккаунта не раскрываем
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }

        RateLimiter::clear($throttleKey);

        $token = $admin->createToken('admin')->plainTextToken;
        Analytics::push("admin:{$admin->id}", ['name' => 'admin.login']);

        return ['admin' => $admin, 'token' => $token];
    }
}
