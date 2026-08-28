<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Exceptions;

/** Доменные инварианты организации-покупателя. */
final class OrganizationRuleViolation extends LicensingRuleViolation
{
    /** Организация с лицензиями (в любом статусе) не удаляется. */
    public static function hasLicenses(): self
    {
        return self::withMessages([
            'organization' => ['Organization has licenses and cannot be deleted.'],
        ]);
    }
}
