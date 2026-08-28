<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\License;

use Cms\Licensing\Application\DTOs\License\LicenseDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Лицензия в ответе: организация, план, ключ, сроки и вычисленный статус (Д5).
 *
 * @property LicenseDTO $resource
 */
final class LicenseResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'key' => $this->resource->key,
            'status' => $this->resource->status,
            'organization' => $this->resource->organization,
            'plan' => $this->resource->plan,
            'issued_at' => $this->resource->issued_at,
            'expires_at' => $this->resource->expires_at,
            'revoked_at' => $this->resource->revoked_at,
        ];
    }
}
