<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Exceptions;

/** Доменные инварианты плана лицензионной поставки и его фич. */
final class PlanRuleViolation extends LicensingRuleViolation
{
    /** `code` уникален в пределах проекта. */
    public static function codeTaken(): self
    {
        return self::withMessages([
            'code' => ['Plan code is already taken.'],
        ]);
    }

    /** План с выпущенными лицензиями (в любом статусе) не удаляется. */
    public static function hasLicenses(): self
    {
        return self::withMessages([
            'plan' => ['Plan has licenses and cannot be deleted.'],
        ]);
    }

    /** Комбинация plan+organization+code уникальна. */
    public static function duplicateFeature(): self
    {
        return self::withMessages([
            'code' => ['Feature code is already present for this plan.'],
        ]);
    }

    /** Переопределение адресует организацию текущего проекта. */
    public static function unknownOrganization(): self
    {
        return self::withMessages([
            'organization_id' => ['Unknown organization.'],
        ]);
    }
}
