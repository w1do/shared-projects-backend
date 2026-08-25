<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Resources\Report;

use Cms\Analytics\Application\DTOs\Report\UserHistoryRowDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property UserHistoryRowDTO $resource */
final class UserHistoryRowResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'event_id' => $this->resource->event_id,
            'occurred_at' => $this->resource->occurred_at,
            'name' => $this->resource->name,
            'source' => $this->resource->source,
            'path' => $this->resource->path,
            'value_minor' => $this->resource->value_minor,
            'currency' => $this->resource->currency,
            'props' => $this->resource->props,
        ];
    }
}
