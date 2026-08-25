<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Plan;

use Cms\Pay\Domain\Models\Plan;
use Spatie\LaravelData\Data;

final class PlanDTO extends Data
{
    /**
     * @param  array<string, string>  $options
     * @param  list<string>  $features
     */
    public function __construct(
        public int $id,
        public string $code,
        public string $name,
        public int $price_minor,
        public string $currency,
        public string $interval,
        public bool $archived,
        public array $options = [],
        public array $features = [],
    ) {}

    public static function fromModel(Plan $plan): self
    {
        return new self(
            id: $plan->id,
            code: $plan->code,
            name: $plan->name,
            price_minor: $plan->price_minor,
            currency: $plan->currency,
            interval: $plan->interval,
            archived: $plan->isArchived(),
            options: $plan->relationLoaded('options') ? $plan->options->pluck('value', 'key')->all() : [],
            features: $plan->relationLoaded('features') ? array_values(array_map('strval', $plan->features->pluck('code')->all())) : [],
        );
    }
}
