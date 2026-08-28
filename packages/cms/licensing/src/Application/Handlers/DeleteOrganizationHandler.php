<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\DeleteOrganizationCommand;
use Cms\Licensing\Application\Exceptions\OrganizationRuleViolation;

final class DeleteOrganizationHandler
{
    public function handle(DeleteOrganizationCommand $command): void
    {
        $organization = $command->organization;

        // Организация с лицензиями (в любом статусе) не удаляется
        if ($organization->licenses()->exists()) {
            throw OrganizationRuleViolation::hasLicenses();
        }

        // Переопределения фич уходят каскадом (FK cascadeOnDelete)
        $organization->delete();
    }
}
