<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\Plan;

use Cms\Licensing\Application\DTOs\Plan\PlanDTO;
use Cms\Licensing\Application\DTOs\PlanFeature\PlanFeatureDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * План поставки в ответе: атрибуты, базовые фичи и переопределения
 * по организациям.
 *
 * @property PlanDTO $resource
 */
final class PlanResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $feature = fn (PlanFeatureDTO $f): array => [
            'id' => $f->id,
            'organization_id' => $f->organization_id,
            'code' => $f->code,
            'name' => $f->name,
        ];

        return [
            'id' => $this->resource->id,
            'code' => $this->resource->code,
            'name' => $this->resource->name,
            'price_minor' => $this->resource->price_minor,
            'currency' => $this->resource->currency,
            'interval' => $this->resource->interval,
            'features' => array_map($feature, $this->resource->features),
            'overrides' => array_map($feature, $this->resource->overrides),
        ];
    }
}
