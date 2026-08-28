<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\RenewLicenseCommand;
use Cms\Licensing\Application\Exceptions\LicenseRuleViolation;
use Cms\Licensing\Domain\Models\License;
use Illuminate\Support\Carbon;

/**
 * Продление окна обновлений (Д5): только вперёд, ключ прежний, сохранённая
 * `entitled_version` поднимается по каталогу релизов и никогда не понижается.
 * Отозванная лицензия не продлевается — отзыв необратим.
 */
final class RenewLicenseHandler
{
    public function handle(RenewLicenseCommand $command): License
    {
        $license = $command->license;

        if ($license->isRevoked()) {
            throw LicenseRuleViolation::revokedNotRenewable();
        }

        $newUntil = Carbon::parse($command->updatesUntil);
        if ($newUntil->toDateString() <= $license->updates_until->toDateString()) {
            throw LicenseRuleViolation::renewalMustExtend();
        }

        $license->updates_until = $newUntil->startOfDay();
        $license->save();
        $license->raiseEntitledVersion();

        return $license;
    }
}
