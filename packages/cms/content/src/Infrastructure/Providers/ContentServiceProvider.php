<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Providers;

use Cms\Content\Console\PublishManifestCommand;
use Cms\Content\Domain\Contracts\ContentCache;
use Cms\Content\Domain\Models\Tag;
use Cms\Content\Infrastructure\Jobs\PublishScheduledJob;
use Cms\Content\Infrastructure\Persistence\CategoryTranslatableSubjectRepository;
use Cms\Content\Infrastructure\Persistence\VersionedContentCache;
use Cms\Localization\Infrastructure\Persistence\TranslatableSubjectRegistry;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\ServiceProvider;

final class ContentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../../../config/cms-content.php', 'cms-content');

        // Теги проекта: модель пакета подменяется своей, с project_id и scope.
        $this->app->make('config')->set('tags.tag_model', Tag::class);

        // Кэш публичных ответов — за портом: Application знает только контракт.
        $this->app->singleton(ContentCache::class, VersionedContentCache::class);

        // Имена категорий доступны автопереводу словаря только через порт localization.
        $this->app->tag([CategoryTranslatableSubjectRepository::class], TranslatableSubjectRegistry::TAG);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/admin.php');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/public.php');

        if ($this->app->runningInConsole()) {
            $this->commands([PublishManifestCommand::class]);
        }

        // Отложенная публикация — раз в минуту
        $this->callAfterResolving(Schedule::class, function (Schedule $schedule): void {
            $schedule->job(new PublishScheduledJob)->everyMinute();
        });
    }
}
