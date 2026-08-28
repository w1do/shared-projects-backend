<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\RevokeLicenseCommand;
use Cms\Licensing\Application\Exceptions\LicenseRuleViolation;
use Cms\Licensing\Domain\Models\License;

/** Отзыв лицензии — ручной и необратимый (Д5); payload не перезаписывается. */
final class RevokeLicenseHandler
{
    public function handle(RevokeLicenseCommand $command): License
    {
        $license = $command->license;

        if ($license->isRevoked()) {
            throw LicenseRuleViolation::alreadyRevoked();
        }

        $license->revoked_at = now();
        $license->save();

        return $license;
    }
}
