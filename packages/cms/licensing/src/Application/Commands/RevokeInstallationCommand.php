<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Domain\Models\LicenseInstallation;

/** Операторский отзыв отдельной копии (Д7): слот лимита освобождается. */
final readonly class RevokeInstallationCommand
{
    public function __construct(public LicenseInstallation $installation) {}
}
