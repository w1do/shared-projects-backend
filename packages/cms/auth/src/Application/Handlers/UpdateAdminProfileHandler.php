<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\UpdateAdminProfileCommand;
use Cms\Auth\Application\Exceptions\AuthRuleViolation;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Policies\PasswordChangePolicy;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Spatie\LaravelData\Optional;

final class UpdateAdminProfileHandler
{
    public function __construct(
        private readonly PasswordChangePolicy $passwords,
        private readonly AuditRecorder $audit,
    ) {}

    public function handle(UpdateAdminProfileCommand $command): Admin
    {
        if (! $command->data->password instanceof Optional) {
            $current = $command->data->current_password instanceof Optional ? '' : $command->data->current_password;
            if (! $this->passwords->allowsChange($command->admin->password, $current)) {
                throw AuthRuleViolation::currentPasswordIncorrect();
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
        $this->audit->record(AuditAction::AdminProfileUpdated, actorId: (string) $command->admin->id);

        return $command->admin;
    }
}
