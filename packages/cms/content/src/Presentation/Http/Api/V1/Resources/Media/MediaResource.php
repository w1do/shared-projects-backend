<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Resources\Media;

use Cms\Content\Application\DTOs\Media\MediaDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property MediaDTO $resource */
final class MediaResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return $this->resource->toArray();
    }
}
