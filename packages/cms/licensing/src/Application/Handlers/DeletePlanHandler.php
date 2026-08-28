<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\DeletePlanCommand;
use Cms\Licensing\Application\Exceptions\PlanRuleViolation;

final class DeletePlanHandler
{
    public function handle(DeletePlanCommand $command): void
    {
        $plan = $command->plan;

        // План с выпущенными лицензиями (в любом статусе) не удаляется
        if ($plan->licenses()->exists()) {
            throw PlanRuleViolation::hasLicenses();
        }

        // Фичи и переопределения уходят каскадом (FK cascadeOnDelete)
        $plan->delete();
    }
}
