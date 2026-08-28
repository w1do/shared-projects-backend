<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Application\DTOs\License\LicenseValidationDTO;
use Cms\Licensing\Domain\Enums\LicenseStatus;
use Cms\Licensing\Domain\Models\License;

/**
 * Публичная онлайн-валидация ключа (Д6): проект резолвится по самому ключу
 * (`acrossProjects` — у публичного маршрута нет проектного контекста);
 * несуществующий, отозванный и истёкший ключи неразличимы в ответе.
 */
final class ValidateLicenseQuery
{
    public function handle(string $key): LicenseValidationDTO
    {
        $license = License::acrossProjects()->where('key', $key)->first();

        if ($license === null || $license->status() !== LicenseStatus::Active) {
            return LicenseValidationDTO::invalid();
        }

        return LicenseValidationDTO::fromActiveLicense($license);
    }
}
