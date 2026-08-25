<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Resources\Plan;

use Cms\Pay\Application\DTOs\Plan\PlanDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Тариф в ответе. Деньги — целые минорные единицы (И4): `Money` живёт
 * только во внутренних вычислениях и на границу API не выходит.
 *
 * @property PlanDTO $resource
 */
final class PlanResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'code' => $this->resource->code,
            'name' => $this->resource->name,
            'price_minor' => $this->resource->price_minor,
            'currency' => $this->resource->currency,
            'interval' => $this->resource->interval,
            'archived' => $this->resource->archived,
            'options' => $this->resource->options,
            'features' => $this->resource->features,
        ];
    }
}
