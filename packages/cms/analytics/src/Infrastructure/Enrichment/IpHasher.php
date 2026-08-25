<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Enrichment;

use Cms\Analytics\Domain\Contracts\IpAnonymizer;

/** Сырой IP не хранится нигде — только соль-хэш (GDPR/152-ФЗ). */
final class IpHasher implements IpAnonymizer
{
    public function hash(?string $ip): string
    {
        if ($ip === null || $ip === '') {
            return '';
        }

        return hash('sha256', $ip.config('cms-analytics.ip_salt'));
    }
}
