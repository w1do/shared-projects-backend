<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Domain\Models\PlanFeature;

final readonly class DeletePlanFeatureCommand
{
    public function __construct(public PlanFeature $feature) {}
}
