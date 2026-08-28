<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Contracts;

/** Порт генерации активационных ключей `LIC-XXXXX-…` (Д3). */
interface LicenseKeyGenerator
{
    /** Глобально уникальный активационный ключ. */
    public function generate(): string;
}
