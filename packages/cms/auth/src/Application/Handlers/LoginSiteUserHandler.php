<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\LoginSiteUserCommand;
use Cms\Auth\Domain\Exceptions\TooManyAttempts;
use Cms\Auth\Domain\Models\User;
use Cms\Shared\Analytics\Analytics;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

final class LoginSiteUserHandler
{
    /** @return array{user: User, token: string} */
    public function handle(LoginSiteUserCommand $command): array
    {
        $throttleKey = "web-login:{$command->projectId}:".strtolower($command->data->email)."|{$command->ip}";
        if (RateLimiter::tooManyAttempts($throttleKey, (int) config('cms-auth.login_rate_limit', 5))) {
            throw new TooManyAttempts;
        }

        $user = User::acrossProjects()
            ->where('project_id', $command->projectId)
            ->where('email', $command->data->email)
            ->first();

        if ($user === null || $user->isBlocked() || ! Hash::check($command->data->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }

        RateLimiter::clear($throttleKey);

        $token = $user->createToken('web', ['project:'.$command->projectId])->plainTextToken;
        Analytics::push($user->subjectKey(), ['name' => 'user.login'], $command->projectId);

        return ['user' => $user, 'token' => $token];
    }
}
