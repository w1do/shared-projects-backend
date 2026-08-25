<?php

declare(strict_types=1);

namespace Cms\Content;

use Cms\Content\Console\PublishManifestCommand;
use Cms\Content\Infrastructure\Jobs\PublishScheduledJob;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\ServiceProvider;

final class ContentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/cms-content.php', 'cms-content');
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../routes/admin.php');
        $this->loadRoutesFrom(__DIR__.'/../routes/public.php');

        if ($this->app->runningInConsole()) {
            $this->commands([PublishManifestCommand::class]);
        }

        // Отложенная публикация — раз в минуту
        $this->callAfterResolving(Schedule::class, function (Schedule $schedule): void {
            $schedule->job(new PublishScheduledJob)->everyMinute();
        });
    }
}
