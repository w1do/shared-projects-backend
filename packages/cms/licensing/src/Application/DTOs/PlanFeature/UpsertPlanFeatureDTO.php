<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\PlanFeature;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

/**
 * Фича плана (Д4): без `organization_id` — базовая, с ним — переопределение
 * для конкретной организации.
 */
final class UpsertPlanFeatureDTO extends Data
{
    public function __construct(
        public string $code,
        public string $name,
        public int|Optional|null $organization_id,
    ) {}
}
