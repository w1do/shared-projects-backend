<?php

declare(strict_types=1);

namespace Cms\Pay;

use Cms\Pay\Console\PublishManifestCommand;
use Cms\Pay\Infrastructure\Jobs\RenewDueSubscriptionsJob;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\ServiceProvider;

final class PayServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../routes/admin.php');
        $this->loadRoutesFrom(__DIR__.'/../routes/public.php');
        $this->loadRoutesFrom(__DIR__.'/../routes/webhooks.php');

        if ($this->app->runningInConsole()) {
            $this->commands([PublishManifestCommand::class]);
        }

        $this->callAfterResolving(Schedule::class, function (Schedule $schedule): void {
            $schedule->job(new RenewDueSubscriptionsJob, 'critical')->hourly();
        });
    }
}
