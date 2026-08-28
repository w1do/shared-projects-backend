<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Listeners;

use Cms\Contracts\Events\SubscriptionStarted;
use Cms\Licensing\Application\Commands\IssueLicenseCommand;
use Cms\Licensing\Application\Commands\RenewLicenseCommand;
use Cms\Licensing\Application\Handlers\IssueLicenseHandler;
use Cms\Licensing\Application\Handlers\RenewLicenseHandler;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Illuminate\Support\Carbon;

/**
 * Авто-выпуск perpetual-лицензии при оформлении подписки организации на
 * лицензионный план (Д10): `updates_until` = конец оплаченного периода,
 * ключ — в `key_encrypted` до первого показа (Д8). При существующей
 * неотозванной лицензии плана — продление окна, не дубль; идемпотентен:
 * повтор события с тем же концом периода — noop. «Чужие» события
 * (site_user, тарифный план pay) игнорируются.
 */
final class IssueLicenseOnSubscriptionStarted
{
    public function __construct(
        private readonly IssueLicenseHandler $issue,
        private readonly RenewLicenseHandler $renew,
    ) {}

    public function handle(SubscriptionStarted $event): void
    {
        if ($event->subjectType !== 'license_plan' || $event->subscriberType !== 'organization') {
            return;
        }

        // acrossProjects + явный project_id события: контекст может отсутствовать
        $organization = Organization::acrossProjects()
            ->where('project_id', $event->projectId)
            ->whereKey($event->subscriberId)
            ->first();
        $plan = Plan::acrossProjects()
            ->where('project_id', $event->projectId)
            ->whereKey($event->subjectId)
            ->first();
        if ($organization === null || $plan === null) {
            return;
        }

        $periodEnd = Carbon::parse($event->periodEndsAt);

        $existing = License::acrossProjects()
            ->where('project_id', $event->projectId)
            ->where('organization_id', $organization->id)
            ->where('plan_id', $plan->id)
            ->whereNull('revoked_at')
            ->first();

        if ($existing !== null) {
            if ($periodEnd->toDateString() > $existing->updates_until->toDateString()) {
                $this->renew->handle(new RenewLicenseCommand($existing, $periodEnd));
            }

            return;
        }

        $this->issue->handle(new IssueLicenseCommand(
            organization: $organization,
            plan: $plan,
            updatesUntil: $periodEnd,
            encryptKey: true,
        ));
    }
}
