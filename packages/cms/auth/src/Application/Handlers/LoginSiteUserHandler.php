<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\LoginSiteUserCommand;
use Cms\Auth\Application\DTOs\User\SiteAuthTokenDTO;
use Cms\Auth\Application\Exceptions\AuthRuleViolation;
use Cms\Auth\Domain\Models\User;
use Cms\Auth\Infrastructure\Persistence\AttemptThrottle;
use Cms\Shared\Analytics\Analytics;
use Illuminate\Support\Facades\Hash;

final class LoginSiteUserHandler
{
    public function __construct(private readonly AttemptThrottle $throttle) {}

    public function handle(LoginSiteUserCommand $command): SiteAuthTokenDTO
    {
        $throttleKey = "web-login:{$command->projectId}:".strtolower($command->data->email)."|{$command->ip}";
        $this->throttle->ensureNotExceeded($throttleKey, (int) config('cms-auth.login_rate_limit', 5));

        $user = User::acrossProjects()
            ->where('project_id', $command->projectId)
            ->where('email', $command->data->email)
            ->first();

        if ($user === null || $user->isBlocked() || ! Hash::check($command->data->password, $user->password)) {
            $this->throttle->hit($throttleKey, 60);

            throw AuthRuleViolation::invalidCredentials();
        }

        $this->throttle->clear($throttleKey);

        $token = $user->createToken('web', ['project:'.$command->projectId])->plainTextToken;
        Analytics::push($user->subjectKey(), ['name' => 'user.login'], $command->projectId);

        return SiteAuthTokenDTO::forUser($token, $user);
    }
}
