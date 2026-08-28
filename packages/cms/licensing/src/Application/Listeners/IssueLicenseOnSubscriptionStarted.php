<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Listeners;

use Cms\Contracts\Events\SubscriptionStarted;
use Cms\Licensing\Application\Commands\IssueLicenseCommand;
use Cms\Licensing\Application\Commands\ReissueLicenseCommand;
use Cms\Licensing\Application\Handlers\IssueLicenseHandler;
use Cms\Licensing\Application\Handlers\ReissueLicenseHandler;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;

/**
 * Авто-выпуск лицензии при оформлении подписки организации на лицензионный
 * план (Д15): `expires_at` = конец оплаченного периода. При существующей
 * неотозванной (в т.ч. истёкшей) лицензии плана — продление, не дубль;
 * идемпотентен: повтор события перевыпускает с тем же сроком. «Чужие»
 * события (site_user, тарифный план pay) игнорируются.
 */
final class IssueLicenseOnSubscriptionStarted
{
    public function __construct(
        private readonly IssueLicenseHandler $issue,
        private readonly ReissueLicenseHandler $reissue,
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

        $existing = License::acrossProjects()
            ->where('project_id', $event->projectId)
            ->where('organization_id', $organization->id)
            ->where('plan_id', $plan->id)
            ->whereNull('revoked_at')
            ->first();

        if ($existing !== null) {
            $this->reissue->handle(new ReissueLicenseCommand($existing, new \DateTimeImmutable($event->periodEndsAt)));

            return;
        }

        $this->issue->handle(new IssueLicenseCommand($organization, $plan, new \DateTimeImmutable($event->periodEndsAt)));
    }
}
