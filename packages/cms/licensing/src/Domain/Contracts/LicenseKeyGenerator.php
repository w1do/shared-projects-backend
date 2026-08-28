<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Contracts;

/** Порт генерации активационных ключей `LIC-XXXX-XXXX-XXXX-XXXX` (Д3). */
interface LicenseKeyGenerator
{
    /** Глобально уникальный активационный ключ в канонической форме. */
    public function generate(): string;
}
