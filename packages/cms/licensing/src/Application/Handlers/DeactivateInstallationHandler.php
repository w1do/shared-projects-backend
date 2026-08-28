<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\DeactivateInstallationCommand;
use Cms\Licensing\Application\Exceptions\LicenseActivationError;
use Cms\Licensing\Domain\Models\License;

/**
 * Клиентская деактивация установки (Д7): помечает копию отозванной,
 * слот лимита освобождается для активации с новым `install_id`.
 */
final class DeactivateInstallationHandler
{
    public function handle(DeactivateInstallationCommand $command): void
    {
        $license = License::findByKey($command->key) ?? throw LicenseActivationError::licenseNotFound();

        $installation = $license->activeInstallations()
            ->where('install_id', $command->installId)
            ->first() ?? throw LicenseActivationError::unknownInstallation();

        $installation->revoked_at = now();
        $installation->save();
    }
}
