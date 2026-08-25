<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\UpdateSiteProfileCommand;
use Cms\Auth\Application\Exceptions\AuthRuleViolation;
use Cms\Auth\Domain\Models\User;
use Cms\Auth\Domain\Policies\PasswordChangePolicy;
use Spatie\LaravelData\Optional;

final class UpdateSiteProfileHandler
{
    public function __construct(private readonly PasswordChangePolicy $passwords) {}

    public function handle(UpdateSiteProfileCommand $command): User
    {
        if (! $command->data->password instanceof Optional) {
            $current = $command->data->current_password instanceof Optional ? '' : $command->data->current_password;
            if (! $this->passwords->allowsChange($command->user->password, $current)) {
                throw AuthRuleViolation::currentPasswordIncorrect();
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
