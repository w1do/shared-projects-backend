<?php

declare(strict_types=1);

namespace Cms\Licensing\Infrastructure\Persistence;

use Cms\Licensing\Domain\Contracts\LicenseSigner;

/** Ed25519-реализация подписи лицензий на libsodium (Д3). */
final class Ed25519LicenseSigner implements LicenseSigner
{
    public function __construct(private readonly SigningKeyRepository $keys) {}

    public function sign(string $projectId, string $data): string
    {
        $secret = base64_decode($this->keys->forProject($projectId)->secret_key, true);
        if ($secret === false || $secret === '') {
            throw new \RuntimeException('Corrupted signing key.');
        }

        return base64_encode(sodium_crypto_sign_detached($data, $secret));
    }

    public function publicKey(string $projectId): string
    {
        return $this->keys->forProject($projectId)->public_key;
    }
}
