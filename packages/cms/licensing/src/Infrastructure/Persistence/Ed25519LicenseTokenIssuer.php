<?php

declare(strict_types=1);

namespace Cms\Licensing\Infrastructure\Persistence;

use Cms\Licensing\Domain\Contracts\LicenseTokenIssuer;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\LicenseInstallation;

/**
 * Выпуск лицензионных токенов (Д4): подпись считается по тем же сырым байтам
 * JSON, что закодированы в токен — пересборка JSON при проверке запрещена
 * контрактом; base64url без паддинга.
 */
final class Ed25519LicenseTokenIssuer implements LicenseTokenIssuer
{
    public function __construct(private readonly SigningKeyRepository $keys) {}

    public function issue(License $license, LicenseInstallation $installation, ?string $entitledVersion): string
    {
        return $this->sign($license, $installation, $entitledVersion, (int) config('cms-licensing.token_ttl_days'));
    }

    public function issueOffline(License $license, LicenseInstallation $installation, ?string $entitledVersion): string
    {
        return $this->sign($license, $installation, $entitledVersion, (int) config('cms-licensing.offline_token_ttl_days'));
    }

    private function sign(License $license, LicenseInstallation $installation, ?string $entitledVersion, int $ttlDays): string
    {
        $json = json_encode([
            'v' => 1,
            'license_id' => $license->id,
            'install_id' => $installation->install_id,
            'domain' => $installation->domain,
            'edition' => $license->edition,
            'features' => $license->features,
            'entitled_version' => $entitledVersion,
            'updates_until' => $license->updatesWindowEnd()->getTimestamp(),
            'status' => $license->status()->value,
            'issued_at' => now()->getTimestamp(),
            'expires_at' => now()->addDays($ttlDays)->getTimestamp(),
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

        $secret = base64_decode($this->keys->forProject($license->project_id)->secret_key, true);
        if ($secret === false || $secret === '') {
            throw new \RuntimeException('Corrupted signing key.');
        }

        return self::b64url($json).'.'.self::b64url(sodium_crypto_sign_detached($json, $secret));
    }

    private static function b64url(string $raw): string
    {
        return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
    }
}
