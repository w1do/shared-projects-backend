<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Resources\Report;

use Cms\Analytics\Application\DTOs\Report\RevenueRowDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property RevenueRowDTO $resource */
final class RevenueRowResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'date' => $this->resource->date,
            'currency' => $this->resource->currency,
            'revenue_minor' => $this->resource->revenue_minor,
            'payments' => $this->resource->payments,
        ];
    }
}
