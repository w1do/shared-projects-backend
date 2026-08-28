<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Resources\ProviderAccount;

use Cms\Pay\Application\DTOs\ProviderAccount\ProviderAccountDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Строка списка настроек провайдеров: метаданные и признак наличия
 * credentials — без значений секретов (Д3).
 *
 * @property ProviderAccountDTO $resource
 */
final class ProviderAccountListItemResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'provider' => $this->resource->provider,
            'group' => $this->resource->group,
            'label' => $this->resource->label,
            'name' => $this->resource->name,
            'status' => $this->resource->status,
            'return_url' => $this->resource->return_url,
            'fail_url' => $this->resource->fail_url,
            'has_credentials' => $this->resource->has_credentials,
        ];
    }
}
