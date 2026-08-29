<?php

declare(strict_types=1);

namespace Cms\Auth\Console;

use Cms\Auth\Application\Commands\SeedOperatorCommand;
use Cms\Auth\Application\Handlers\SeedOperatorHandler;
use Illuminate\Console\Command;

/** Бутстрап-команда стека: создаёт корневого оператора из config cms-auth.operator. */
final class SeedOperatorConsoleCommand extends Command
{
    /** Пароль оператора из dev-дефолтов compose. */
    private const DEV_PASSWORD = 'secret-123';

    protected $signature = 'operator:seed';

    protected $description = 'Seed the root operator (idempotent, from ADMIN_EMAIL/ADMIN_PASSWORD)';

    public function handle(SeedOperatorHandler $handler): int
    {
        $email = (string) config('cms-auth.operator.email');
        $password = (string) config('cms-auth.operator.password');

        if ($email === '' || $password === '') {
            $this->warn('ADMIN_EMAIL/ADMIN_PASSWORD are not set — operator seed skipped.');

            return self::SUCCESS;
        }

        // Дефолты из compose публичны: в production они дали бы super-admin,
        // логин и пароль которого знает любой читатель репозитория
        if (app()->environment('production') && $password === self::DEV_PASSWORD) {
            $this->warn('ADMIN_PASSWORD is the public dev default — operator seed skipped in production.');

            return self::SUCCESS;
        }

        $admin = $handler->handle(new SeedOperatorCommand($email, $password));

        $this->info($admin->wasRecentlyCreated
            ? "Operator '{$admin->email}' created."
            : "Operator '{$admin->email}' already exists — left untouched.");

        return self::SUCCESS;
    }
}
