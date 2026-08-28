<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\PlanFeature;

use Cms\Licensing\Domain\Models\PlanFeature;
use Spatie\LaravelData\Data;

final class PlanFeatureDTO extends Data
{
    public function __construct(
        public int $id,
        public int $plan_id,
        public ?int $organization_id,
        public string $code,
        public string $name,
    ) {}

    public static function fromModel(PlanFeature $feature): self
    {
        return new self(
            id: $feature->id,
            plan_id: $feature->plan_id,
            organization_id: $feature->organization_id,
            code: $feature->code,
            name: $feature->name,
        );
    }
}
