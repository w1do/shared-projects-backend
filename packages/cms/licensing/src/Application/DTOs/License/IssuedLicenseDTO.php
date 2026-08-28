<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\License;

use Cms\Licensing\Domain\Models\License;
use Spatie\LaravelData\Data;

/**
 * Результат выпуска лицензии: полный ключ существует только здесь —
 * единственный показ (Д3); в хранилище остаются хэш и префикс.
 */
final class IssuedLicenseDTO extends Data
{
    public function __construct(
        public LicenseDTO $license,
        public string $key,
    ) {}

    public static function fromModel(License $license, string $key): self
    {
        return new self(license: LicenseDTO::fromModel($license), key: $key);
    }
}
