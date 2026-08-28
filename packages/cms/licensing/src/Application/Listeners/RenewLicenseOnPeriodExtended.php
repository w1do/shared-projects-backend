<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Listeners;

use Cms\Contracts\Events\SubscriptionPeriodExtended;
use Cms\Licensing\Application\Commands\RenewLicenseCommand;
use Cms\Licensing\Application\Handlers\RenewLicenseHandler;
use Cms\Licensing\Domain\Models\License;
use Illuminate\Support\Carbon;

/**
 * Продление лицензии оплатой периода (Д10): тот же RenewLicenseHandler, что
 * у ручного admin-продления — сдвиг `updates_until` и подъём
 * `entitled_version`, ключ прежний. Отозванная лицензия игнорируется —
 * отзыв необратим. Идемпотентен: повтор события с тем же сроком — noop.
 * Работает и в вебхук-джобе без проектного контекста.
 */
final class RenewLicenseOnPeriodExtended
{
    public function __construct(private readonly RenewLicenseHandler $renew) {}

    public function handle(SubscriptionPeriodExtended $event): void
    {
        if ($event->subjectType !== 'license_plan' || $event->subscriberType !== 'organization') {
            return;
        }

        $license = License::acrossProjects()
            ->where('project_id', $event->projectId)
            ->where('organization_id', $event->subscriberId)
            ->where('plan_id', $event->subjectId)
            ->whereNull('revoked_at')
            ->first();
        if ($license === null) {
            return;
        }

        $periodEnd = Carbon::parse($event->periodEndsAt);
        if ($periodEnd->toDateString() <= $license->updates_until->toDateString()) {
            return;
        }

        $this->renew->handle(new RenewLicenseCommand($license, $periodEnd));
    }
}
