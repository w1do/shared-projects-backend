<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Support;

/** Сырой IP не хранится нигде — только соль-хэш (GDPR/152-ФЗ). */
final class IpHasher
{
    public static function hash(?string $ip): string
    {
        if ($ip === null || $ip === '') {
            return '';
        }

        return hash('sha256', $ip.config('cms-analytics.ip_salt'));
    }
}
