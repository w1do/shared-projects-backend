<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Contracts;

use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\LicenseInstallation;

/**
 * Порт выпуска лицензионных токенов (Д4): `b64url(payload).b64url(signature)`,
 * Ed25519 detached по сырым байтам payload ключом проекта лицензии.
 * Токен выдаётся и по отозванной лицензии — со `status: revoked` в payload.
 */
interface LicenseTokenIssuer
{
    /** Онлайн-токен: TTL 30 дней (конфиг `token_ttl_days`). */
    public function issue(License $license, LicenseInstallation $installation, ?string $entitledVersion): string;

    /** Офлайн-токен для закрытых контуров: TTL 1 год (конфиг `offline_token_ttl_days`). */
    public function issueOffline(License $license, LicenseInstallation $installation, ?string $entitledVersion): string;
}
