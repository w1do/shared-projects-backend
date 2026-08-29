<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\SeedOperatorCommand;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Infrastructure\Persistence\PermissionSyncer;

/**
 * Идемпотентный сид корневого оператора: firstOrCreate по email + глобальная
 * роль super-admin. Существующий оператор (включая изменённый пароль) не трогается.
 */
final class SeedOperatorHandler
{
    public function handle(SeedOperatorCommand $command): Admin
    {
        $admin = Admin::query()->firstOrCreate(
            ['email' => $command->email],
            ['name' => 'Root', 'password' => $command->password],
        );

        PermissionSyncer::grantSuperAdmin($admin);

        return $admin;
    }
}
