<?php

declare(strict_types=1);

namespace Cms\Ai\Infrastructure\Providers;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Infrastructure\Ai\LaravelAiOperations;
use Cms\Ai\Infrastructure\Ai\StructuredPromptRunner;
use Cms\Ai\Infrastructure\Ai\StructuredResponseMapper;
use Cms\Ai\Infrastructure\Config\AiProviderConfig;
use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;

final class AiPackageServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../../../config/cms-ai.php', 'cms-ai');

        $this->app->singleton(AiProviderConfig::class, function (Application $app): AiProviderConfig {
            /** @var ConfigRepository $config */
            $config = $app->make(ConfigRepository::class);

            /** @var array<string, mixed> $values */
            $values = (array) $config->get('cms-ai', []);
            $provider = AiProviderConfig::fromArray($values);

            // Провайдер SDK конфигурируется нашими ENV-значениями: ключ и базовый
            // адрес (Polza по умолчанию) — сменный провайдер без правки кода.
            // Объявляется СВОЙ экземпляр `ai.providers.cms-ai`: записи чужого
            // пакета не переписываются, значения до SDK доезжают те же.
            /** @var array<string, mixed> $driverDefaults */
            $driverDefaults = (array) $config->get('ai.providers.'.$provider->driver, ['driver' => $provider->driver]);
            $config->set('ai.providers.'.AiProviderConfig::INSTANCE, $provider->toProviderInstance($driverDefaults));

            return $provider;
        });

        $this->app->singleton(AiOperations::class, fn (Application $app): AiOperations => new LaravelAiOperations(
            new StructuredPromptRunner($app->make(AiProviderConfig::class)),
            new StructuredResponseMapper,
        ));
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([__DIR__.'/../../../config/cms-ai.php' => config_path('cms-ai.php')], 'cms-ai-config');
        }
    }
}
