<?php

declare(strict_types=1);

namespace Cms\Localization\Infrastructure\Providers;

use Cms\Contracts\Localization\LocalizationKeys;
use Cms\Localization\Console\LocalizeSyncCommand;
use Cms\Localization\Domain\Contracts\LocalizationReader;
use Cms\Localization\Domain\Contracts\LocalizePort;
use Cms\Localization\Domain\Contracts\TranslatableSubjectRepository;
use Cms\Localization\Infrastructure\Persistence\DatabaseLocalizationReader;
use Cms\Localization\Infrastructure\Persistence\LocalizeRegistry;
use Cms\Localization\Infrastructure\Persistence\TranslatableSubjectRegistry;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;

final class LocalizationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../../../config/cms-localization.php', 'cms-localization');

        // Реестр собирается из тега контейнера: пакеты-владельцы переводимых
        // данных регистрируют свои адаптеры сами (Decision 10).
        $this->app->singleton(TranslatableSubjectRegistry::class, function (Application $app): TranslatableSubjectRegistry {
            $repositories = array_values(array_filter(
                iterator_to_array($app->tagged(TranslatableSubjectRegistry::TAG)),
                fn (mixed $repository): bool => $repository instanceof TranslatableSubjectRepository,
            ));

            return new TranslatableSubjectRegistry($repositories);
        });

        // Реестр локализаций наполняется enum-ами из cms/contracts: у каждого
        // сервиса своя БД, поэтому ключи всех сервисов собирает content-service.
        $this->app->singleton(LocalizePort::class, function (Application $app): LocalizePort {
            $registry = new LocalizeRegistry;

            /** @var list<class-string<LocalizationKeys>> $sources */
            $sources = (array) $app->make('config')->get('cms-localization.registries', []);
            foreach ($sources as $source) {
                $registry->register($source::service(), $source::locale(), $source::entries());
            }

            return $registry;
        });

        $this->app->bind(LocalizationReader::class, DatabaseLocalizationReader::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/admin.php');

        if ($this->app->runningInConsole()) {
            $this->commands([LocalizeSyncCommand::class]);
        }

        $this->callAfterResolving(Schedule::class, function (Schedule $schedule): void {
            $schedule->command('localize:sync')->dailyAt('03:30');
        });
    }
}
