<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\DeletePlanFeatureCommand;

final class DeletePlanFeatureHandler
{
    public function handle(DeletePlanFeatureCommand $command): void
    {
        $command->feature->delete();
    }
}
