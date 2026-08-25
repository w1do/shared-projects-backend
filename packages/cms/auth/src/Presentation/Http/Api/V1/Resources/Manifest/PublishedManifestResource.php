<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Resources\Manifest;

use Cms\Auth\Application\DTOs\Manifest\PublishedManifestDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property PublishedManifestDTO $resource */
final class PublishedManifestResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return $this->resource->toArray();
    }
}
