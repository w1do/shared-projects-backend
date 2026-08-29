<?php

declare(strict_types=1);

namespace Cms\Research\Presentation\Http\Api\V1\Resources;

use Cms\Research\Application\DTOs\Research\ResearchDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property ResearchDTO $resource */
final class ResearchResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return $this->resource->toArray();
    }
}
