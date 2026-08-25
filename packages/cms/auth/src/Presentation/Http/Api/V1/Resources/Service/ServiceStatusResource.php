<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Resources\Service;

use Cms\Auth\Application\DTOs\Service\ServiceStatusDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property ServiceStatusDTO $resource */
final class ServiceStatusResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return $this->resource->toArray();
    }
}
