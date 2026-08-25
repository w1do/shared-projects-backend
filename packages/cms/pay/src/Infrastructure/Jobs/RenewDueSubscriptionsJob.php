<?php

declare(strict_types=1);

namespace Cms\Pay\Infrastructure\Jobs;

use Cms\Pay\Application\Commands\RenewSubscriptionCommand;
use Cms\Pay\Application\Handlers\RenewSubscriptionHandler;
use Cms\Pay\Domain\Enums\SubscriptionStatus;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;

/** Ежечасно: платёж продления для подписок с истёкшим периодом (очередь critical). */
final class RenewDueSubscriptionsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;

    public int $timeout = 300;

    public function handle(RenewSubscriptionHandler $renew, ProjectContext $context): void
    {
        $due = Subscription::acrossProjects()
            ->whereIn('status', [SubscriptionStatus::Active, SubscriptionStatus::PastDue])
            ->where('current_period_ends_at', '<=', now())
            ->where('renewal_attempts', '<', 5)
            ->get();

        foreach ($due as $subscription) {
            $context->set($subscription->project_id);
            try {
                $renew->handle(new RenewSubscriptionCommand($subscription));
            } finally {
                $context->clear();
            }
        }
    }
}
