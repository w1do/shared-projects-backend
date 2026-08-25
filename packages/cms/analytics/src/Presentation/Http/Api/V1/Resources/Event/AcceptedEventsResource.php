<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Resources\Event;

use Cms\Analytics\Application\DTOs\Event\AcceptedEventsDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** @property AcceptedEventsDTO $resource */
final class AcceptedEventsResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return ['accepted' => $this->resource->accepted];
    }
}
