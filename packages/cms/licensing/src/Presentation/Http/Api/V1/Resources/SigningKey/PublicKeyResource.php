<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\SigningKey;

use Cms\Licensing\Application\DTOs\SigningKey\PublicKeyDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Публичный ключ подписи проекта; приватный ключ не покидает хранилище (Д3).
 *
 * @property PublicKeyDTO $resource
 */
final class PublicKeyResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return ['public_key' => $this->resource->public_key];
    }
}
