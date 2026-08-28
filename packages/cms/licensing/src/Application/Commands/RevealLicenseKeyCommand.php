<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Domain\Models\License;

/**
 * Однократный показ ключа авто-выпущенной лицензии (Д8): после показа
 * шифрованная копия необратимо затирается, в хранилище остаётся только хэш.
 */
final readonly class RevealLicenseKeyCommand
{
    public function __construct(public License $license) {}
}
