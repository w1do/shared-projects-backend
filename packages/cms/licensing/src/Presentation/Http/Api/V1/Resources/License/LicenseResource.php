<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\License;

use Cms\Licensing\Application\DTOs\License\LicenseDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Лицензия в ответе: entitlements, префикс ключа (полный ключ недоступен),
 * окно обновлений, лимит установок и вычисленный статус (Д2).
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
            'key_prefix' => $this->resource->key_prefix,
            'status' => $this->resource->status,
            'organization' => $this->resource->organization,
            'plan' => $this->resource->plan,
            'edition' => $this->resource->edition,
            'features' => $this->resource->features,
            'entitled_version' => $this->resource->entitled_version,
            'updates_until' => $this->resource->updates_until,
            'max_installations' => $this->resource->max_installations,
            'active_installations' => $this->resource->active_installations,
            'reveal_available' => $this->resource->reveal_available,
            'note' => $this->resource->note,
            'issued_at' => $this->resource->issued_at,
            'revoked_at' => $this->resource->revoked_at,
        ];
    }
}
