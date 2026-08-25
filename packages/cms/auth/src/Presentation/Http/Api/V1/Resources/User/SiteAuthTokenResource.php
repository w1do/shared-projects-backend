<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Resources\User;

use Cms\Auth\Application\DTOs\User\SiteAuthTokenDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property SiteAuthTokenDTO $resource */
final class SiteAuthTokenResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return $this->resource->toArray();
    }
}
