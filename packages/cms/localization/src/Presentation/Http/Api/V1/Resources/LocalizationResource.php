<?php

declare(strict_types=1);

namespace Cms\Localization\Presentation\Http\Api\V1\Resources;

use Cms\Localization\Application\DTOs\Localization\LocalizationDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property LocalizationDTO $resource */
final class LocalizationResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return $this->resource->toArray();
    }
}
