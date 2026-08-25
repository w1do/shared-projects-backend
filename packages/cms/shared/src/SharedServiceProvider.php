<?php

declare(strict_types=1);

namespace Cms\Shared;

use Cms\Shared\Analytics\AnalyticsRecorder;
use Cms\Shared\Analytics\NullRecorder;
use Cms\Shared\Analytics\QueuedHttpRecorder;
use Cms\Shared\AuthClient\AuthClient;
use Cms\Shared\AuthClient\CachedIntrospector;
use Cms\Shared\AuthClient\Introspector;
use Cms\Shared\Http\TraceId;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\ServiceProvider;

final class SharedServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/internal.php');
    }

    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/cms.php', 'cms');

        // Строго scoped: под Octane состояние не должно переживать запрос.
        $this->app->scoped(ProjectContext::class);
        $this->app->scoped(TraceId::class);

        $this->app->singleton(AuthClient::class, fn (Application $app) => new AuthClient(
            http: $app->make(Factory::class),
            baseUrl: (string) config('cms.auth_url'),
            serviceToken: (string) config('cms.service_token'),
        ));

        $this->app->singleton(CachedIntrospector::class, fn (Application $app) => new CachedIntrospector(
            client: $app->make(AuthClient::class),
            cache: $app->make('cache.store'),
            ttlSeconds: (int) config('cms.introspection_ttl', 90),
        ));

        // Порт интроспекции: потребители зависят от интерфейса, реализация — кэширующая.
        $this->app->bind(Introspector::class, fn (Application $app) => $app->make(CachedIntrospector::class));

        $this->app->singleton(
            AnalyticsRecorder::class,
            fn () => config('cms.analytics_url')
                ? $this->app->make(QueuedHttpRecorder::class)
                : new NullRecorder,
        );
    }
}
