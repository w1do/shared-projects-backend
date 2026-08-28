<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\Plan;

use Cms\Licensing\Application\DTOs\PlanFeature\PlanFeatureDTO;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Licensing\Domain\Models\PlanFeature;
use Spatie\LaravelData\Data;

final class PlanDTO extends Data
{
    /**
     * @param  list<PlanFeatureDTO>  $features  базовые фичи плана
     * @param  list<PlanFeatureDTO>  $overrides  переопределения по организациям
     */
    public function __construct(
        public int $id,
        public string $code,
        public string $name,
        public ?int $price_minor,
        public ?string $currency,
        public ?string $interval,
        public array $features = [],
        public array $overrides = [],
    ) {}

    public static function fromModel(Plan $plan): self
    {
        $features = $plan->relationLoaded('features') ? $plan->features : collect();

        return new self(
            id: $plan->id,
            code: $plan->code,
            name: $plan->name,
            price_minor: $plan->price_minor,
            currency: $plan->currency,
            interval: $plan->interval,
            features: array_values($features->filter(fn (PlanFeature $f) => $f->isBase())
                ->map(PlanFeatureDTO::fromModel(...))->all()),
            overrides: array_values($features->reject(fn (PlanFeature $f) => $f->isBase())
                ->map(PlanFeatureDTO::fromModel(...))->all()),
        );
    }
}
