<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\RevealLicenseKeyCommand;
use Cms\Licensing\Application\DTOs\License\RevealedKeyDTO;
use Cms\Licensing\Application\Exceptions\LicenseRuleViolation;
use Illuminate\Support\Facades\Crypt;

/**
 * Показ ключа авто-выпущенной лицензии — один раз (Д8): шифрованная копия
 * затирается необратимо, повторный показ — доменная ошибка.
 */
final class RevealLicenseKeyHandler
{
    public function handle(RevealLicenseKeyCommand $command): RevealedKeyDTO
    {
        $license = $command->license;

        if ($license->key_encrypted === null) {
            throw LicenseRuleViolation::keyAlreadyRevealed();
        }

        $key = Crypt::decryptString($license->key_encrypted);
        $license->key_encrypted = null;
        $license->save();

        return new RevealedKeyDTO(key: $key);
    }
}
