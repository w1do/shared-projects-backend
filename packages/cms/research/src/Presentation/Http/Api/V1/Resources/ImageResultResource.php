<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Resources;

use Cms\Research\Domain\ValueObjects\ImageResultItem;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property ImageResultItem $resource */
final class ImageResultResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'link' => $this->resource->link,
            'thumbnail' => $this->resource->thumbnail,
            'width' => $this->resource->width,
            'height' => $this->resource->height,
            'source' => $this->resource->source,
        ];
    }
}
