<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\LoginAdminCommand;
use Cms\Auth\Application\DTOs\Auth\AuthTokenDTO;
use Cms\Auth\Application\Exceptions\AuthRuleViolation;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Infrastructure\Persistence\AttemptThrottle;
use Cms\Shared\Analytics\Analytics;
use Illuminate\Support\Facades\Hash;

final class LoginAdminHandler
{
    public function __construct(private readonly AttemptThrottle $throttle) {}

    public function handle(LoginAdminCommand $command): AuthTokenDTO
    {
        $throttleKey = 'admin-login:'.strtolower($command->data->email).'|'.$command->ip;
        $this->throttle->ensureNotExceeded($throttleKey, (int) config('cms-auth.login_rate_limit', 5));

        $admin = Admin::query()->where('email', $command->data->email)->first();

        if ($admin === null || ! Hash::check($command->data->password, $admin->password)) {
            $this->throttle->hit($throttleKey, 60);

            // Существование аккаунта не раскрываем
            throw AuthRuleViolation::invalidCredentials();
        }

        $this->throttle->clear($throttleKey);

        $token = $admin->createToken('admin')->plainTextToken;
        Analytics::push("admin:{$admin->id}", ['name' => 'admin.login']);

        return AuthTokenDTO::forAdmin($token, $admin);
    }
}
