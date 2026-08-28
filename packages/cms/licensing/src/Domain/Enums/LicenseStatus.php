<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Enums;

/**
 * Статус лицензии — вычисляемый по `revoked_at` (Д2): лицензия бессрочна,
 * «истёкшей» не бывает — истекает только окно обновлений.
 */
enum LicenseStatus: string
{
    case Active = 'active';
    case Revoked = 'revoked';
}
