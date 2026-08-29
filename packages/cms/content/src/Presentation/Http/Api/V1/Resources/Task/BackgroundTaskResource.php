<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Resources\Task;

use Cms\Content\Application\DTOs\Task\BackgroundTaskDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property BackgroundTaskDTO $resource */
final class BackgroundTaskResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return $this->resource->toArray();
    }
}
