<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\License;

use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** Подтверждение деактивации установки (ТЗ 1.7). */
final class DeactivationResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return ['deactivated' => true];
    }
}
