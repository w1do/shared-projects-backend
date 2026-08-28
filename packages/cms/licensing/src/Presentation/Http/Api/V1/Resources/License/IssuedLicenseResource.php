<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\License;

use Cms\Licensing\Application\DTOs\License\IssuedLicenseDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Ответ выпуска лицензии — единственное место с полным ключом (Д3):
 * дальше доступен только префикс.
 *
 * @property IssuedLicenseDTO $resource
 */
final class IssuedLicenseResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            ...(new LicenseResource($this->resource->license))->toArray($request),
            'key' => $this->resource->key,
        ];
    }
}
