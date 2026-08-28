<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Application\DTOs\License\UpdatesCheckDTO;
use Cms\Licensing\Application\Exceptions\LicenseActivationError;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Release;
use Illuminate\Support\Collection;

/**
 * Проверка обновлений (ТЗ 1.7/2.4): доступны релизы окна обновлений и
 * security-патчи внутри уже разрешённых трейнов — даже после `updates_until`;
 * `latest_available` показывается всегда. Отозванная лицензия — 403 (Д6).
 */
final class CheckUpdatesQuery
{
    public function handle(string $key, string $installId, string $appVersion): UpdatesCheckDTO
    {
        $license = License::findByKey($key) ?? throw LicenseActivationError::licenseNotFound();

        $known = $license->activeInstallations()->where('install_id', $installId)->exists();
        if (! $known) {
            throw LicenseActivationError::unknownInstallation();
        }
        if ($license->isRevoked()) {
            throw LicenseActivationError::licenseRevoked();
        }

        $catalog = Release::catalogFor($license->project_id);
        $effective = $license->effectiveEntitledVersion();
        $entitled = $this->entitledReleases($license, $catalog, $effective);

        $latestEntitled = $this->latestVersion($entitled->pluck('version')->when($effective !== null, fn (Collection $v) => $v->push($effective)));
        $latestEntitledRelease = $latestEntitled === null ? null : $catalog->firstWhere('version', $latestEntitled);

        $updates = $entitled->filter(fn (Release $release) => version_compare($release->version, $appVersion, '>'));

        return new UpdatesCheckDTO(
            latest_entitled: $latestEntitled,
            latest_available: $this->latestVersion($catalog->pluck('version')),
            image: $latestEntitledRelease?->image(),
            changelog_url: $latestEntitledRelease?->changelog_url,
            security_update: $updates->contains(fn (Release $release) => $release->is_security),
        );
    }

    /**
     * Релизы, доступные лицензии: внутри окна обновлений или security-патчи
     * разрешённых трейнов (трейн эффективной версии и трейны, чей самый
     * ранний релиз вышел не позже `updates_until`).
     *
     * @param  Collection<int, Release>  $catalog
     * @return Collection<int, Release>
     */
    private function entitledReleases(License $license, Collection $catalog, ?string $effective): Collection
    {
        $windowEnd = $license->updatesWindowEnd();

        $allowedTrains = $catalog
            ->groupBy('train')
            ->filter(fn (Collection $releases) => $releases->min('released_at') <= $windowEnd)
            ->keys();
        if ($effective !== null) {
            $allowedTrains = $allowedTrains->push($this->trainOf($effective))->unique();
        }

        return $catalog->filter(fn (Release $release) => $release->released_at->lessThanOrEqualTo($windowEnd)
            || ($release->is_security && $allowedTrains->contains($release->train)));
    }

    /** @param Collection<int, string> $versions */
    private function latestVersion(Collection $versions): ?string
    {
        return $versions->isEmpty()
            ? null
            : $versions->sort(fn (string $a, string $b) => version_compare($a, $b))->last();
    }

    private function trainOf(string $version): string
    {
        return implode('.', array_slice(explode('.', $version), 0, 2));
    }
}
