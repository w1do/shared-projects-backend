<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Domain\Models\LicenseInstallation;

/**
 * Установка по id в пределах текущего проекта: изоляция — через scope
 * лицензии (`whereHas`), у таблицы установок собственного project_id нет.
 */
final class FindInstallationQuery
{
    public function handle(int $installationId): LicenseInstallation
    {
        return LicenseInstallation::query()
            ->whereHas('license')
            ->findOrFail($installationId);
    }
}
