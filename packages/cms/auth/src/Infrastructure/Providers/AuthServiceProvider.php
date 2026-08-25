<?php

declare(strict_types=1);

namespace Cms\Auth;

use Cms\Auth\Console\PublishManifestCommand;
use Cms\Auth\Domain\Exceptions\TooManyAttempts;
use Cms\Auth\Domain\Models\Admin;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

final class AuthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/cms-auth.php', 'cms-auth');
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../routes/admin.php');
        $this->loadRoutesFrom(__DIR__.'/../routes/public.php');
        $this->loadRoutesFrom(__DIR__.'/../routes/internal.php');

        if ($this->app->runningInConsole()) {
            $this->commands([PublishManifestCommand::class]);
        }

        // Роль super-admin проходит любую проверку прав в любом проекте
        Gate::before(function ($user) {
            return $user instanceof Admin && $user->isSuperAdmin() ? true : null;
        });

        // 429 для превышения rate limit в командах
        $this->callAfterResolving(ExceptionHandler::class, function (ExceptionHandler $handler): void {
            if (method_exists($handler, 'renderable')) {
                $handler->renderable(fn (TooManyAttempts $e) => ErrorEnvelope::respond('too_many_attempts', 'Too many attempts.', 429));
            }
        });
    }
}
