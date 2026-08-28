<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\PlanFeature;

use Cms\Licensing\Application\DTOs\PlanFeature\PlanFeatureDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Фича плана в ответе.
 *
 * @property PlanFeatureDTO $resource
 */
final class PlanFeatureResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'plan_id' => $this->resource->plan_id,
            'organization_id' => $this->resource->organization_id,
            'code' => $this->resource->code,
            'name' => $this->resource->name,
        ];
    }
}
