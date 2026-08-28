<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\Installation;

use Cms\Licensing\Application\DTOs\Installation\InstallationDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Установка лицензии в admin-ответах (Д7/Д11).
 *
 * @property InstallationDTO $resource
 */
final class InstallationResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'install_id' => $this->resource->install_id,
            'domain' => $this->resource->domain,
            'app_version' => $this->resource->app_version,
            'last_ip' => $this->resource->last_ip,
            'last_seen_at' => $this->resource->last_seen_at,
            'status' => $this->resource->status,
            'revoked_at' => $this->resource->revoked_at,
        ];
    }
}
