<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\UpdateAdminProfileCommand;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Infrastructure\Support\Audit;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Spatie\LaravelData\Optional;

final class UpdateAdminProfileHandler
{
    public function handle(UpdateAdminProfileCommand $command): Admin
    {
        if (! $command->data->password instanceof Optional) {
            $current = $command->data->current_password instanceof Optional ? '' : $command->data->current_password;
            if (! Hash::check($current, $command->admin->password)) {
                throw ValidationException::withMessages(['current_password' => ['Current password is incorrect.']]);
            }
            $command->admin->password = $command->data->password;
        }

        if (! $command->data->name instanceof Optional) {
            $command->admin->name = $command->data->name;
        }
        if (! $command->data->locale instanceof Optional) {
            $command->admin->locale = $command->data->locale;
        }

        $command->admin->save();
        Audit::record('admin.profile_updated', actorId: (string) $command->admin->id);

        return $command->admin;
    }
}
