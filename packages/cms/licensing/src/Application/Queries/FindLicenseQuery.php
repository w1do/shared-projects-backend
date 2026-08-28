<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Domain\Models\License;

/**
 * Лицензия проекта по id. Tenant-изоляция — глобальным скоупом
 * `BelongsToProject`: чужая лицензия не находится и даёт 404.
 */
final class FindLicenseQuery
{
    public function handle(string $licenseId): License
    {
        return License::query()
            ->with(['organization', 'plan'])
            ->withCount('activeInstallations')
            ->findOrFail($licenseId);
    }
}
