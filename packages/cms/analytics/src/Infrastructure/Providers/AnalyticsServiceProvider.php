<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Providers;

use Cms\Analytics\Console\FlushCommand;
use Cms\Analytics\Console\MigrateCommand;
use Cms\Analytics\Console\PublishManifestCommand;
use Cms\Analytics\Console\ReplayCommand;
use Cms\Analytics\Domain\Contracts\AnalyticsStore;
use Cms\Analytics\Domain\Contracts\BotDetector;
use Cms\Analytics\Domain\Contracts\IpAnonymizer;
use Cms\Analytics\Domain\Contracts\UserAgentProfiler;
use Cms\Analytics\Infrastructure\Enrichment\BotFilter;
use Cms\Analytics\Infrastructure\Enrichment\IpHasher;
use Cms\Analytics\Infrastructure\Enrichment\UserAgentParser;
use Cms\Analytics\Infrastructure\Jobs\PruneRawEventsJob;
use Cms\Analytics\Infrastructure\Jobs\RollupDailyJob;
use Cms\Analytics\Infrastructure\Persistence\ClickHouse\Connection;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\ServiceProvider;

final class AnalyticsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../../../config/cms-analytics.php', 'cms-analytics');

        // Application знает только порты; адаптеры — инфраструктурные реализации.
        $this->app->bind(AnalyticsStore::class, Connection::class);
        $this->app->bind(UserAgentProfiler::class, UserAgentParser::class);
        $this->app->bind(IpAnonymizer::class, IpHasher::class);
        $this->app->bind(BotDetector::class, BotFilter::class);
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../../../routes/public.php');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/admin.php');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/internal.php');

        if ($this->app->runningInConsole()) {
            $this->commands([FlushCommand::class, ReplayCommand::class, MigrateCommand::class, PublishManifestCommand::class]);
        }

        $this->callAfterResolving(Schedule::class, function (Schedule $schedule): void {
            $schedule->job(new RollupDailyJob, 'analytics')->dailyAt('03:00');
            $schedule->job(new PruneRawEventsJob, 'analytics')->weeklyOn(1, '04:00');
        });
    }
}
