<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\License;

use Cms\Licensing\Application\DTOs\License\ActivationResultDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Ответ activate/refresh (ТЗ 1.7): токен, состояние, интервал refresh.
 *
 * @property ActivationResultDTO $resource
 */
final class ActivationResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'token' => $this->resource->token,
            'state' => $this->resource->state,
            'refresh_in' => $this->resource->refresh_in,
        ];
    }
}
