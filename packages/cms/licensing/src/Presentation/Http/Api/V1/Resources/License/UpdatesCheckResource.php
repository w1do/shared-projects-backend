<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\License;

use Cms\Licensing\Application\DTOs\License\UpdatesCheckDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Ответ `updates/check` (ТЗ 1.7).
 *
 * @property UpdatesCheckDTO $resource
 */
final class UpdatesCheckResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'latest_entitled' => $this->resource->latest_entitled,
            'latest_available' => $this->resource->latest_available,
            'image' => $this->resource->image,
            'changelog_url' => $this->resource->changelog_url,
            'security_update' => $this->resource->security_update,
        ];
    }
}
