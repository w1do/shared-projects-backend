<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\Organization;

use Cms\Licensing\Application\DTOs\Organization\OrganizationDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Анкета организации в ответе.
 *
 * @property OrganizationDTO $resource
 */
final class OrganizationResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'contact_first_name' => $this->resource->contact_first_name,
            'contact_last_name' => $this->resource->contact_last_name,
            'phone' => $this->resource->phone,
            'email' => $this->resource->email,
            'telegram' => $this->resource->telegram,
            'activity' => $this->resource->activity,
            'employees_count' => $this->resource->employees_count,
            'usage_purpose' => $this->resource->usage_purpose,
            'created_at' => $this->resource->created_at,
        ];
    }
}
