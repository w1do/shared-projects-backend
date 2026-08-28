<?php

declare(strict_types=1);

namespace Cms\Licensing\Infrastructure\Providers;

use Cms\Contracts\Events\SubscriptionPeriodExtended;
use Cms\Contracts\Events\SubscriptionStarted;
use Cms\Licensing\Application\Listeners\IssueLicenseOnSubscriptionStarted;
use Cms\Licensing\Application\Listeners\RenewLicenseOnPeriodExtended;
use Cms\Licensing\Console\PublishManifestCommand;
use Cms\Licensing\Domain\Contracts\LicenseKeyGenerator;
use Cms\Licensing\Domain\Contracts\LicenseSigner;
use Cms\Licensing\Domain\Contracts\LicenseTokenIssuer;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Licensing\Infrastructure\Persistence\ActivationKeyGenerator;
use Cms\Licensing\Infrastructure\Persistence\Ed25519LicenseSigner;
use Cms\Licensing\Infrastructure\Persistence\Ed25519LicenseTokenIssuer;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

final class LicensingServiceProvider extends ServiceProvider
{
    /**
     * Листенеры межмодульных событий подписки (Д10): синхронные, как все
     * доменные события платформы (И8) — при ошибке транзакция продления
     * откатывается целиком, лицензия и подписка не разъезжаются.
     *
     * @var array<class-string, list<class-string>>
     */
    private const LISTENERS = [
        SubscriptionStarted::class => [IssueLicenseOnSubscriptionStarted::class],
        SubscriptionPeriodExtended::class => [RenewLicenseOnPeriodExtended::class],
    ];

    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../../../config/cms-licensing.php', 'cms-licensing');

        $this->app->bind(LicenseSigner::class, Ed25519LicenseSigner::class);
        $this->app->bind(LicenseKeyGenerator::class, ActivationKeyGenerator::class);
        $this->app->bind(LicenseTokenIssuer::class, Ed25519LicenseTokenIssuer::class);
    }

    public function boot(): void
    {
        // Морф-алиасы полиморфных подписок (Д10/Д11): организация — подписчик,
        // лицензионный план — предмет; в БД хранятся алиасы, не FQCN
        Relation::morphMap([
            'organization' => Organization::class,
            'license_plan' => Plan::class,
        ]);

        $this->loadMigrationsFrom(__DIR__.'/../../../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/admin.php');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/public.php');

        if ($this->app->runningInConsole()) {
            $this->commands([PublishManifestCommand::class]);
        }

        $events = $this->app->make(Dispatcher::class);
        foreach (self::LISTENERS as $event => $listeners) {
            foreach ($listeners as $listener) {
                $events->listen($event, $listener);
            }
        }
    }
}
