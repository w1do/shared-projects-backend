<?php

declare(strict_types=1);

namespace Cms\Ai;

use Cms\Ai\Domain\Contracts\AiOperations;
use Cms\Ai\Infrastructure\LaravelAiOperations;
use Illuminate\Support\ServiceProvider;

final class AiPackageServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/cms-ai.php', 'cms-ai');

        $this->app->singleton(AiOperations::class, function (): AiOperations {
            /** @var array{provider: string, api_key: ?string, base_url: string, model: string, timeout: int} $config */
            $config = config('cms-ai');

            return new LaravelAiOperations($config);
        });
    }

    public function boot(): void
    {
        // Провайдер SDK конфигурируется нашими ENV-значениями: ключ и базовый
        // адрес (Polza по умолчанию) — сменный провайдер без правки кода.
        $provider = (string) config('cms-ai.provider', 'openai');
        config([
            "ai.providers.{$provider}.key" => config('cms-ai.api_key'),
            "ai.providers.{$provider}.url" => config('cms-ai.base_url'),
        ]);

        if ($this->app->runningInConsole()) {
            $this->publishes([__DIR__.'/../config/cms-ai.php' => config_path('cms-ai.php')], 'cms-ai-config');
        }
    }
}
