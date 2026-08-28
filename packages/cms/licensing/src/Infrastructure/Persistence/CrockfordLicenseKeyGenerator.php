<?php

declare(strict_types=1);

namespace Cms\Licensing\Infrastructure\Persistence;

use Cms\Licensing\Domain\Contracts\LicenseKeyGenerator;
use Cms\Licensing\Domain\Models\License;

/**
 * Активационный ключ `LIC-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX` (Д3):
 * 25 символов Crockford Base32 из криптографического ГСЧ (~125 бит),
 * глобальная уникальность проверяется по таблице лицензий.
 */
final class CrockfordLicenseKeyGenerator implements LicenseKeyGenerator
{
    private const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

    private const KEY_LENGTH = 25;

    public function generate(): string
    {
        do {
            $key = 'LIC-'.implode('-', str_split($this->randomBase32(), 5));
        } while (License::acrossProjects()->where('key', $key)->exists());

        return $key;
    }

    private function randomBase32(): string
    {
        $chars = '';
        foreach (str_split(random_bytes(self::KEY_LENGTH)) as $byte) {
            $chars .= self::ALPHABET[ord($byte) % 32];
        }

        return $chars;
    }
}
