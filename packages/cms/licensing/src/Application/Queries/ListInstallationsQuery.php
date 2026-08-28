<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\LicenseInstallation;
use Illuminate\Support\Collection;

/**
 * Установки лицензии с фильтром «кто отстал» (Д11): `app_version` ниже
 * заданной. Сравнение SemVer — в PHP: объём ограничен лимитом установок.
 */
final class ListInstallationsQuery
{
    /** @return Collection<int, LicenseInstallation> */
    public function handle(License $license, ?string $appVersionBelow = null): Collection
    {
        $installations = $license->installations()
            ->orderByDesc('last_seen_at')
            ->orderByDesc('id')
            ->get();

        if ($appVersionBelow === null) {
            return $installations;
        }

        return $installations
            ->filter(fn (LicenseInstallation $installation) => $installation->app_version !== null
                && version_compare($installation->app_version, $appVersionBelow, '<'))
            ->values();
    }
}
