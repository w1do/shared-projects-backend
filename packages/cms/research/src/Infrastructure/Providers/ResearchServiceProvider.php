<?php

declare(strict_types=1);

namespace Cms\Research\Infrastructure\Providers;

use Cms\Content\Domain\Events\PostDeleted;
use Cms\Research\Console\ProvisionKnowledgeCommand;
use Cms\Research\Domain\Contracts\KnowledgeBase;
use Cms\Research\Domain\Contracts\PageContentFetcher;
use Cms\Research\Domain\Contracts\SerpSearchClient;
use Cms\Research\Infrastructure\Listeners\ReleaseTopicOnPostDeleted;
use Cms\Research\Infrastructure\Persistence\QdrantKnowledgeBase;
use Cms\Research\Infrastructure\Search\HttpPageContentFetcher;
use Cms\Research\Infrastructure\Search\SerpApiSearchClient;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

final class ResearchServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../../../config/cms-research.php', 'cms-research');

        // Внешние службы — за портами: смена поисковой службы или хранилища
        // знаний не выходит за границу Infrastructure.
        $this->app->bind(SerpSearchClient::class, SerpApiSearchClient::class);
        $this->app->bind(PageContentFetcher::class, HttpPageContentFetcher::class);
        $this->app->bind(KnowledgeBase::class, QdrantKnowledgeBase::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/admin.php');

        // Удалённый пост освобождает свою тему: content о ресёрче не знает.
        Event::listen(PostDeleted::class, ReleaseTopicOnPostDeleted::class);

        if ($this->app->runningInConsole()) {
            $this->commands([ProvisionKnowledgeCommand::class]);

            $this->publishes(
                [__DIR__.'/../../../config/cms-research.php' => config_path('cms-research.php')],
                'cms-research-config',
            );
        }
    }
}
