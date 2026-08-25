<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Resources\Auth;

use Cms\Auth\Application\DTOs\Auth\AdminProfileDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property AdminProfileDTO $resource */
final class AdminProfileResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return $this->resource->toArray();
    }
}
