<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\License;

use Cms\Licensing\Application\DTOs\License\OfflineActivationDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Результат офлайн-активации (ТЗ 2.7): консоль собирает из ответа
 * токен-файл для клиента в закрытом контуре.
 *
 * @property OfflineActivationDTO $resource
 */
final class OfflineActivationResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'token' => $this->resource->token,
            'install_id' => $this->resource->install_id,
            'domain' => $this->resource->domain,
        ];
    }
}
