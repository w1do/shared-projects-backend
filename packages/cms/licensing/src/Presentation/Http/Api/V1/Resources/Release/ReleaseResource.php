<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\Release;

use Cms\Licensing\Application\DTOs\Release\ReleaseDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Релиз каталога в admin-ответах.
 *
 * @property ReleaseDTO $resource
 */
final class ReleaseResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'version' => $this->resource->version,
            'train' => $this->resource->train,
            'repository' => $this->resource->repository,
            'released_at' => $this->resource->released_at,
            'is_security' => $this->resource->is_security,
            'min_upgrade_from' => $this->resource->min_upgrade_from,
            'changelog_url' => $this->resource->changelog_url,
        ];
    }
}
