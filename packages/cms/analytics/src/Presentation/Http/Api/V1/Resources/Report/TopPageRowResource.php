<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Resources\Report;

use Cms\Analytics\Application\DTOs\Report\TopPageRowDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property TopPageRowDTO $resource */
final class TopPageRowResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'path' => $this->resource->path,
            'hits' => $this->resource->hits,
            'sessions' => $this->resource->sessions,
        ];
    }
}
