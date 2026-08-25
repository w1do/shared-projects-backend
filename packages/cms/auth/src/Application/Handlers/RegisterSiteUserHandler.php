<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\RegisterSiteUserCommand;
use Cms\Auth\Application\DTOs\User\SiteAuthTokenDTO;
use Cms\Auth\Application\Exceptions\AuthRuleViolation;
use Cms\Auth\Domain\Models\User;
use Cms\Shared\Analytics\Analytics;
use Spatie\LaravelData\Optional;

final class RegisterSiteUserHandler
{
    public function handle(RegisterSiteUserCommand $command): SiteAuthTokenDTO
    {
        $exists = User::acrossProjects()
            ->where('project_id', $command->projectId)
            ->where('email', $command->data->email)
            ->exists();

        if ($exists) {
            throw AuthRuleViolation::emailAlreadyRegistered();
        }

        $user = User::create([
            'project_id' => $command->projectId,
            'email' => $command->data->email,
            'password' => $command->data->password,
            'name' => $command->data->name instanceof Optional ? null : $command->data->name,
        ]);

        $token = $user->createToken('web', ['project:'.$command->projectId])->plainTextToken;

        Analytics::push($user->subjectKey(), ['name' => 'user.registered'], $command->projectId);

        return SiteAuthTokenDTO::forUser($token, $user);
    }
}
