<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\UpdateSiteProfileCommand;
use Cms\Auth\Domain\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Spatie\LaravelData\Optional;

final class UpdateSiteProfileHandler
{
    public function handle(UpdateSiteProfileCommand $command): User
    {
        if (! $command->data->password instanceof Optional) {
            $current = $command->data->current_password instanceof Optional ? '' : $command->data->current_password;
            if (! Hash::check($current, $command->user->password)) {
                throw ValidationException::withMessages(['current_password' => ['Current password is incorrect.']]);
            }
            $command->user->password = $command->data->password;
        }

        if (! $command->data->name instanceof Optional) {
            $command->user->name = $command->data->name;
        }

        $command->user->save();

        return $command->user;
    }
}
