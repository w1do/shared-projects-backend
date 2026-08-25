<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\RegisterSiteUserCommand;
use Cms\Auth\Domain\Models\User;
use Cms\Shared\Analytics\Analytics;
use Illuminate\Validation\ValidationException;
use Spatie\LaravelData\Optional;

final class RegisterSiteUserHandler
{
    /** @return array{user: User, token: string} */
    public function handle(RegisterSiteUserCommand $command): array
    {
        $exists = User::acrossProjects()
            ->where('project_id', $command->projectId)
            ->where('email', $command->data->email)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages(['email' => ['Email is already registered.']]);
        }

        $user = User::create([
            'project_id' => $command->projectId,
            'email' => $command->data->email,
            'password' => $command->data->password,
            'name' => $command->data->name instanceof Optional ? null : $command->data->name,
        ]);

        $token = $user->createToken('web', ['project:'.$command->projectId])->plainTextToken;

        Analytics::push($user->subjectKey(), ['name' => 'user.registered'], $command->projectId);

        return ['user' => $user, 'token' => $token];
    }
}
