<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Resources\City;

use Cms\Content\Application\DTOs\City\CityDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property CityDTO $resource */
final class CityResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return $this->resource->toArray();
    }
}
