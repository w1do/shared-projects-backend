<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Exceptions;

/** Доменные инварианты лицензии. */
final class LicenseRuleViolation extends LicensingRuleViolation
{
    /** Отзыв необратим: повторный отзыв отклоняется (Д5). */
    public static function alreadyRevoked(): self
    {
        return self::withMessages([
            'license' => ['License is already revoked.'],
        ]);
    }
}
