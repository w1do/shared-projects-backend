<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Providers;

use Cms\Auth\Console\PublishManifestConsoleCommand;
use Cms\Auth\Console\SeedOperatorConsoleCommand;
use Cms\Auth\Console\SeedProjectConsoleCommand;
use Cms\Auth\Console\SyncPermissionsConsoleCommand;
use Cms\Auth\Domain\Models\Admin;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

final class AuthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../../../config/cms-auth.php', 'cms-auth');
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/admin.php');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/public.php');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/internal.php');

        if ($this->app->runningInConsole()) {
            $this->commands([
                PublishManifestConsoleCommand::class,
                SeedOperatorConsoleCommand::class,
                SeedProjectConsoleCommand::class,
                SyncPermissionsConsoleCommand::class,
            ]);
        }

        // Роль super-admin проходит любую проверку прав в любом проекте
        Gate::before(function ($user) {
            return $user instanceof Admin && $user->isSuperAdmin() ? true : null;
        });

        // Маппинг TooManyAttempts -> HTTP 429 живёт в bootstrap/app.php приложения:
        // это presentation-логика композиционного корня, а не пакета.
    }
}
