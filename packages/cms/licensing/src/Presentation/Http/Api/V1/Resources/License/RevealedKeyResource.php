<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\License;

use Cms\Licensing\Application\DTOs\License\RevealedKeyDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Однократный показ ключа авто-выпущенной лицензии (Д8).
 *
 * @property RevealedKeyDTO $resource
 */
final class RevealedKeyResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return ['key' => $this->resource->key];
    }
}
