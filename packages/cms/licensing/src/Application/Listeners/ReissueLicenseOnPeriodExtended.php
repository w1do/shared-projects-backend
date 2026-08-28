<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Listeners;

use Cms\Contracts\Events\SubscriptionPeriodExtended;
use Cms\Licensing\Application\Commands\ReissueLicenseCommand;
use Cms\Licensing\Application\Handlers\ReissueLicenseHandler;
use Cms\Licensing\Domain\Models\License;

/**
 * Продление лицензии оплатой периода (Д15): перевыпуск payload той же
 * лицензии с новым `expires_at`, активационный ключ прежний. Отозванная
 * лицензия игнорируется — остаётся `revoked`, отзыв необратим. Идемпотентен:
 * повтор события даёт тот же срок. Работает и в вебхук-джобе без проектного
 * контекста — выборка `acrossProjects` + явный project_id события.
 */
final class ReissueLicenseOnPeriodExtended
{
    public function __construct(private readonly ReissueLicenseHandler $reissue) {}

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

        $this->reissue->handle(new ReissueLicenseCommand($license, new \DateTimeImmutable($event->periodEndsAt)));
    }
}
