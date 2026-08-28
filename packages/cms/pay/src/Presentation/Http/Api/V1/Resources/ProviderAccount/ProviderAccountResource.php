<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Resources\ProviderAccount;

use Cms\Pay\Application\DTOs\ProviderAccount\ProviderAccountDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Полные настройки провайдера, включая расшифрованные credentials —
 * только под правом `pay.providers.manage` (Д3): форма редактирования
 * и копирование между проектами.
 *
 * @property ProviderAccountDTO $resource
 */
final class ProviderAccountResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'provider' => $this->resource->provider,
            'group' => $this->resource->group,
            'label' => $this->resource->label,
            'name' => $this->resource->name,
            'credentials' => (object) $this->resource->credentials,
            'properties' => (object) $this->resource->properties,
            'return_url' => $this->resource->return_url,
            'fail_url' => $this->resource->fail_url,
            'status' => $this->resource->status,
        ];
    }
}
