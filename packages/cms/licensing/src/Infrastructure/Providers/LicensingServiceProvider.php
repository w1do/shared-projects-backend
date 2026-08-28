<?php

declare(strict_types=1);

namespace Cms\Licensing\Infrastructure\Providers;

use Cms\Contracts\Events\SubscriptionPeriodExtended;
use Cms\Contracts\Events\SubscriptionStarted;
use Cms\Licensing\Application\Listeners\IssueLicenseOnSubscriptionStarted;
use Cms\Licensing\Application\Listeners\ReissueLicenseOnPeriodExtended;
use Cms\Licensing\Domain\Contracts\LicenseKeyGenerator;
use Cms\Licensing\Domain\Contracts\LicenseSigner;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Licensing\Infrastructure\Persistence\CrockfordLicenseKeyGenerator;
use Cms\Licensing\Infrastructure\Persistence\Ed25519LicenseSigner;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

final class LicensingServiceProvider extends ServiceProvider
{
    /**
     * Листенеры межмодульных событий подписки (Д12/Д15): синхронные, как все
     * доменные события платформы (И8) — при ошибке транзакция продления
     * откатывается целиком, лицензия и подписка не разъезжаются.
     *
     * @var array<class-string, list<class-string>>
     */
    private const LISTENERS = [
        SubscriptionStarted::class => [IssueLicenseOnSubscriptionStarted::class],
        SubscriptionPeriodExtended::class => [ReissueLicenseOnPeriodExtended::class],
    ];

    public function register(): void
    {
        $this->app->bind(LicenseSigner::class, Ed25519LicenseSigner::class);
        $this->app->bind(LicenseKeyGenerator::class, CrockfordLicenseKeyGenerator::class);
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

        $events = $this->app->make(Dispatcher::class);
        foreach (self::LISTENERS as $event => $listeners) {
            foreach ($listeners as $listener) {
                $events->listen($event, $listener);
            }
        }
    }
}
