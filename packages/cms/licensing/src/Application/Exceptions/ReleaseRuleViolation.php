<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Exceptions;

/** Доменные инварианты каталога релизов. */
final class ReleaseRuleViolation extends LicensingRuleViolation
{
    /** Версия уникальна в пределах проекта. */
    public static function versionTaken(): self
    {
        return self::withMessages([
            'version' => ['Release version is already registered in the project.'],
        ]);
    }
}
