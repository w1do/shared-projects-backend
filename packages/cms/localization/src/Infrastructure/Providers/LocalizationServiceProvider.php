<?php

declare(strict_types=1);

namespace Cms\Localization\Infrastructure\Providers;

use Cms\Localization\Domain\Contracts\TranslatableSubjectRepository;
use Cms\Localization\Infrastructure\Persistence\TranslatableSubjectRegistry;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;

final class LocalizationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Реестр собирается из тега контейнера: пакеты-владельцы переводимых
        // данных регистрируют свои адаптеры сами (Decision 10).
        $this->app->singleton(TranslatableSubjectRegistry::class, function (Application $app): TranslatableSubjectRegistry {
            $repositories = array_values(array_filter(
                iterator_to_array($app->tagged(TranslatableSubjectRegistry::TAG)),
                fn (mixed $repository): bool => $repository instanceof TranslatableSubjectRepository,
            ));

            return new TranslatableSubjectRegistry($repositories);
        });
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/admin.php');
    }
}
