<?php

declare(strict_types=1);

namespace Cms\Licensing\Infrastructure\Persistence;

use Cms\Licensing\Domain\Contracts\LicenseKeyGenerator;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\ValueObjects\LicenseKey;

/**
 * Активационный ключ `LIC-XXXX-XXXX-XXXX-XXXX` (Д3): 16 символов алфавита
 * без `0 O 1 I` (~80 бит) из `random_int()`; глобальная уникальность
 * проверяется по `key_hash`.
 */
final class ActivationKeyGenerator implements LicenseKeyGenerator
{
    private const GROUPS = 4;

    private const GROUP_LENGTH = 4;

    public function generate(): string
    {
        do {
            $key = 'LIC-'.implode('-', array_map(
                fn () => $this->randomGroup(),
                range(1, self::GROUPS),
            ));
        } while (License::acrossProjects()->where('key_hash', LicenseKey::fromInput($key)->hash())->exists());

        return $key;
    }

    private function randomGroup(): string
    {
        $alphabet = LicenseKey::ALPHABET;
        $chars = '';
        for ($i = 0; $i < self::GROUP_LENGTH; $i++) {
            $chars .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }

        return $chars;
    }
}
