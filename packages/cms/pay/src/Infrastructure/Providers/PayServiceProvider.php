<?php

declare(strict_types=1);

namespace Cms\Pay\Infrastructure\Providers;

use Cms\Pay\Application\Listeners\ExtendSubscriptionPeriod;
use Cms\Pay\Application\Listeners\PushPaymentRefundEvent;
use Cms\Pay\Application\Listeners\PushPaymentStatusEvent;
use Cms\Pay\Application\Listeners\RecordChargeInLedger;
use Cms\Pay\Application\Listeners\RecordRefundInLedger;
use Cms\Pay\Console\PublishManifestCommand;
use Cms\Pay\Domain\Events\PaymentRefunded;
use Cms\Pay\Domain\Events\PaymentStatusChanged;
use Cms\Pay\Domain\Events\PaymentSucceeded;
use Cms\Pay\Infrastructure\Jobs\RenewDueSubscriptionsJob;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Support\ServiceProvider;

final class PayServiceProvider extends ServiceProvider
{
    /**
     * Листенеры доменных событий платежа. Порядок внутри события —
     * порядок побочных эффектов, и он зафиксирован (И8): леджер, затем
     * продление подписки, затем аналитика. Ни один листенер не реализует
     * `ShouldQueue`: эффект, ушедший за границу транзакции, теряется.
     *
     * @var array<class-string, list<class-string>>
     */
    private const LISTENERS = [
        PaymentSucceeded::class => [
            RecordChargeInLedger::class,
            ExtendSubscriptionPeriod::class,
        ],
        PaymentStatusChanged::class => [
            PushPaymentStatusEvent::class,
        ],
        PaymentRefunded::class => [
            RecordRefundInLedger::class,
            PushPaymentRefundEvent::class,
        ],
    ];

    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../../../config/cms-pay.php', 'cms-pay');
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/admin.php');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/public.php');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/webhooks.php');

        $this->registerListeners();

        if ($this->app->runningInConsole()) {
            $this->commands([PublishManifestCommand::class]);
        }

        $this->callAfterResolving(Schedule::class, function (Schedule $schedule): void {
            $schedule->job(new RenewDueSubscriptionsJob, 'critical')->hourly();
        });
    }

    private function registerListeners(): void
    {
        $events = $this->app->make(Dispatcher::class);

        foreach (self::LISTENERS as $event => $listeners) {
            foreach ($listeners as $listener) {
                $events->listen($event, $listener);
            }
        }
    }
}
