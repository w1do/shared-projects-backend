<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Resources\Report;

use Cms\Analytics\Application\DTOs\Report\OverviewRowDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property OverviewRowDTO $resource */
final class OverviewRowResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'date' => $this->resource->date,
            'name' => $this->resource->name,
            'events' => $this->resource->events,
            'sessions' => $this->resource->sessions,
            'subjects' => $this->resource->subjects,
        ];
    }
}
