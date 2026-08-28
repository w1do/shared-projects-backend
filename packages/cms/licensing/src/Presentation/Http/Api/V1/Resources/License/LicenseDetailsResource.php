<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Resources\License;

use Cms\Licensing\Application\DTOs\Installation\InstallationDTO;
use Cms\Licensing\Application\DTOs\License\LicenseDTO;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\LicenseInstallation;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Просмотр лицензии: поля лицензии + её установки (спека license-keys).
 *
 * @property License $resource
 */
final class LicenseDetailsResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            ...(new LicenseResource(LicenseDTO::fromModel($this->resource)))->toArray($request),
            'installations' => $this->resource->installations
                ->map(fn (LicenseInstallation $installation) => InstallationDTO::fromModel($installation)->toArray())
                ->all(),
        ];
    }
}
