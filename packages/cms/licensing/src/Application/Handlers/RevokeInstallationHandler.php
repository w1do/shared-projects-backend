<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\RevokeInstallationCommand;
use Cms\Licensing\Application\Exceptions\LicenseRuleViolation;
use Cms\Licensing\Domain\Models\LicenseInstallation;

/** Операторский отзыв копии (Д7): отозванная установка не проходит activate/refresh. */
final class RevokeInstallationHandler
{
    public function handle(RevokeInstallationCommand $command): LicenseInstallation
    {
        $installation = $command->installation;

        if ($installation->isRevoked()) {
            throw LicenseRuleViolation::installationAlreadyRevoked();
        }

        $installation->revoked_at = now();
        $installation->save();

        return $installation;
    }
}
