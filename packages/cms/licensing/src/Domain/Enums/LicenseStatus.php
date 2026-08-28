<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Enums;

/**
 * Статус лицензии — вычисляемый, в БД только факты (Д5):
 * `revoked_at` приоритетнее истечения, отзыв необратим.
 */
enum LicenseStatus: string
{
    case Active = 'active';
    case Expired = 'expired';
    case Revoked = 'revoked';

    public function isValid(): bool
    {
        return $this === self::Active;
    }
}
