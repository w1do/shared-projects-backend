<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\License;

use Cms\Licensing\Application\DTOs\License\LicenseValidationDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Ответ публичной валидации (Д6): у `invalid` — только статус, форма
 * одинакова для несуществующего, отозванного и истёкшего ключа.
 *
 * @property LicenseValidationDTO $resource
 */
final class LicenseValidationResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        if ($this->resource->status !== 'active') {
            return ['status' => 'invalid'];
        }

        return [
            'status' => $this->resource->status,
            'plan' => $this->resource->plan,
            'features' => $this->resource->features,
            'expires_at' => $this->resource->expires_at,
        ];
    }
}
