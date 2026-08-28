<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Contracts\LicenseTokenIssuer;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\LicenseInstallation;
use Cms\Licensing\Domain\Models\SigningKey;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Carbon;

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
});

function licensingTokenFixture(array $licenseAttrs = []): array
{
    $license = License::factory()->create($licenseAttrs);
    $installation = LicenseInstallation::factory()->create([
        'license_id' => $license->id,
        'install_id' => str_repeat('9f2c', 16),
        'domain' => 'crm.client.example',
    ]);

    return [$license, $installation];
}

// ----------------------------------------------------- 1.4 подпись и payload

test('token payload v1 verifies with pure sodium against the project public key', function () {
    Carbon::setTestNow('2026-08-28 12:00:00');
    [$license, $installation] = licensingTokenFixture([
        'edition' => 'pro',
        'features' => ['api', 'warehouse'],
        'entitled_version' => null,
        'updates_until' => '2027-08-28',
    ]);

    $token = app(LicenseTokenIssuer::class)->issue($license, $installation, '1.4.7');

    // base64url без паддинга
    expect($token)->toMatch('/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/');

    $payload = licensingVerifyToken($token);

    expect($payload)->toBe([
        'v' => 1,
        'license_id' => $license->id,
        'install_id' => str_repeat('9f2c', 16),
        'domain' => 'crm.client.example',
        'edition' => 'pro',
        'features' => ['api', 'warehouse'],
        'entitled_version' => '1.4.7',
        'updates_until' => Carbon::parse('2027-08-28')->endOfDay()->getTimestamp(),
        'status' => 'active',
        'issued_at' => Carbon::parse('2026-08-28 12:00:00')->getTimestamp(),
        'expires_at' => Carbon::parse('2026-09-27 12:00:00')->getTimestamp(), // TTL 30 дней
    ]);

    Carbon::setTestNow();
});

test('tampering a single payload byte breaks the signature', function () {
    [$license, $installation] = licensingTokenFixture();

    $token = app(LicenseTokenIssuer::class)->issue($license, $installation, null);
    $parts = licensingSplitToken($token);

    $tampered = $parts['payload'];
    $tampered[5] = $tampered[5] === 'a' ? 'b' : 'a';

    $publicKey = (string) base64_decode(
        SigningKey::acrossProjects()->where('project_id', 'proj-1')->sole()->public_key,
        true,
    );

    expect(sodium_crypto_sign_verify_detached($parts['signature'], $parts['payload'], $publicKey))->toBeTrue()
        ->and(sodium_crypto_sign_verify_detached($parts['signature'], $tampered, $publicKey))->toBeFalse();
});

test('revoked license still gets a correctly signed token with revoked status', function () {
    [$license, $installation] = licensingTokenFixture();
    $license->revoked_at = now();
    $license->save();

    $payload = licensingVerifyToken(app(LicenseTokenIssuer::class)->issue($license, $installation, null));

    expect($payload['status'])->toBe('revoked');
});

// --------------------------------------------------------- 1.4 TTL из конфига

test('online and offline token ttl come from package config', function () {
    Carbon::setTestNow('2026-08-28 12:00:00');
    config(['cms-licensing.token_ttl_days' => 7, 'cms-licensing.offline_token_ttl_days' => 365]);
    [$license, $installation] = licensingTokenFixture();
    $issuer = app(LicenseTokenIssuer::class);

    $online = licensingVerifyToken($issuer->issue($license, $installation, null));
    $offline = licensingVerifyToken($issuer->issueOffline($license, $installation, null));

    expect($online['expires_at'] - $online['issued_at'])->toBe(7 * 86400)
        ->and($offline['expires_at'] - $offline['issued_at'])->toBe(365 * 86400);

    Carbon::setTestNow();
});
