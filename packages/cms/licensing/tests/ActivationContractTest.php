<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\LicenseInstallation;
use Cms\Licensing\Domain\Models\Release;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Carbon;

const LICENSING_TEST_KEY = 'LIC-ABCD-EFGH-JKLM-NPQR';

function licensingActivationLicense(array $attrs = []): License
{
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->withKey(LICENSING_TEST_KEY)->create($attrs);
    app(ProjectContext::class)->clear();

    return $license;
}

function licensingInstallId(string $seed = 'a1'): string
{
    return str_pad($seed, 64, 'a');
}

function licensingActivatePayload(array $overrides = []): array
{
    return array_merge([
        'key' => LICENSING_TEST_KEY,
        'install_id' => licensingInstallId(),
        'domain' => 'crm.client.example',
        'app_version' => '1.0.0',
    ], $overrides);
}

// -------------------------------------------------------- активация (ТЗ 2.3)

test('activation with a valid key issues a verifiable token and registers the installation', function () {
    licensingActivationLicense(['edition' => 'pro', 'features' => ['api'], 'entitled_version' => '1.0.0']);

    $response = $this->postJson('/api/v1/pay/licensing/license/activate', licensingActivatePayload())->assertOk();

    expect($response->json('data.state'))->toBe('licensed')
        ->and($response->json('data.refresh_in'))->toBe(86400);

    $payload = licensingVerifyToken((string) $response->json('data.token'));
    expect($payload['v'])->toBe(1)
        ->and($payload['install_id'])->toBe(licensingInstallId())
        ->and($payload['edition'])->toBe('pro')
        ->and($payload['status'])->toBe('active');

    $installation = LicenseInstallation::query()->sole();
    expect($installation->domain)->toBe('crm.client.example')
        ->and($installation->app_version)->toBe('1.0.0')
        ->and($installation->last_ip)->not->toBeNull()
        ->and($installation->last_seen_at)->not->toBeNull();
});

test('re-activation of the same install_id does not take a second slot', function () {
    licensingActivationLicense(['max_installations' => 1]);

    $this->postJson('/api/v1/pay/licensing/license/activate', licensingActivatePayload())->assertOk();
    $again = $this->postJson('/api/v1/pay/licensing/license/activate', licensingActivatePayload([
        'app_version' => '1.0.1',
    ]))->assertOk();

    expect(LicenseInstallation::query()->count())->toBe(1)
        ->and(LicenseInstallation::query()->sole()->app_version)->toBe('1.0.1')
        ->and($again->json('data.token'))->not->toBeNull();
});

test('installation limit returns 409 with a russian message', function () {
    licensingActivationLicense(['max_installations' => 1]);
    $this->postJson('/api/v1/pay/licensing/license/activate', licensingActivatePayload())->assertOk();

    $response = $this->postJson('/api/v1/pay/licensing/license/activate', licensingActivatePayload([
        'install_id' => licensingInstallId('b2'),
    ]))->assertStatus(409);

    expect($response->json('error.code'))->toBe('installation_limit_reached')
        ->and($response->json('error.message'))->toBe('Достигнут лимит установок по лицензии.')
        ->and(LicenseInstallation::query()->count())->toBe(1);
});

test('unknown key returns 404 license_not_found', function () {
    $response = $this->postJson('/api/v1/pay/licensing/license/activate', licensingActivatePayload([
        'key' => 'LIC-XXXX-XXXX-XXXX-XXXX',
    ]))->assertStatus(404);

    expect($response->json('error.code'))->toBe('license_not_found')
        ->and($response->json('error.message'))->toBe('Лицензия с таким ключом не найдена.');
});

test('invalid fields return 422 validation_failed', function () {
    $response = $this->postJson('/api/v1/pay/licensing/license/activate', [
        'key' => LICENSING_TEST_KEY,
        'install_id' => 'not-hex',
        'domain' => 'crm.client.example',
        'app_version' => 'latest',
    ])->assertStatus(422);

    expect($response->json('error.code'))->toBe('validation_failed');
});

// ---------------------------------------------------------------- refresh

test('refresh with an unknown install_id returns 404 unknown_installation', function () {
    licensingActivationLicense();

    $response = $this->postJson('/api/v1/pay/licensing/license/refresh', licensingActivatePayload())
        ->assertStatus(404);

    expect($response->json('error.code'))->toBe('unknown_installation');
});

test('revoked license still receives a signed revoked token over 200', function () {
    $license = licensingActivationLicense(['revoked_at' => now()]);
    LicenseInstallation::factory()->create([
        'license_id' => $license->id,
        'install_id' => licensingInstallId(),
    ]);

    $response = $this->postJson('/api/v1/pay/licensing/license/refresh', licensingActivatePayload())->assertOk();

    expect($response->json('data.state'))->toBe('revoked');
    $payload = licensingVerifyToken((string) $response->json('data.token'));
    expect($payload['status'])->toBe('revoked');
});

test('operator-revoked installation fails refresh and its slot is reusable', function () {
    $license = licensingActivationLicense(['max_installations' => 1]);
    LicenseInstallation::factory()->revoked()->create([
        'license_id' => $license->id,
        'install_id' => licensingInstallId(),
    ]);

    $this->postJson('/api/v1/pay/licensing/license/refresh', licensingActivatePayload())->assertStatus(404);

    // слот свободен: активация нового install_id проходит
    $this->postJson('/api/v1/pay/licensing/license/activate', licensingActivatePayload([
        'install_id' => licensingInstallId('c3'),
    ]))->assertOk();
});

test('refresh raises the stored entitled version by a release inside the window', function () {
    $license = licensingActivationLicense([
        'entitled_version' => '1.2.0',
        'updates_until' => now()->addMonth()->toDateString(),
    ]);
    LicenseInstallation::factory()->create([
        'license_id' => $license->id,
        'install_id' => licensingInstallId(),
    ]);
    app(ProjectContext::class)->set('proj-1');
    Release::factory()->version('1.4.7')->create(['released_at' => now()->subDay()]);
    app(ProjectContext::class)->clear();

    $payload = licensingVerifyToken((string) $this->postJson(
        '/api/v1/pay/licensing/license/refresh',
        licensingActivatePayload(),
    )->assertOk()->json('data.token'));

    expect($payload['entitled_version'])->toBe('1.4.7')
        ->and($license->fresh()->entitled_version)->toBe('1.4.7');
});

test('release after the window does not raise entitlements in the token', function () {
    $license = licensingActivationLicense([
        'entitled_version' => '1.4.7',
        'updates_until' => now()->subMonth()->toDateString(),
    ]);
    LicenseInstallation::factory()->create([
        'license_id' => $license->id,
        'install_id' => licensingInstallId(),
    ]);
    app(ProjectContext::class)->set('proj-1');
    Release::factory()->version('1.6.0')->create(['released_at' => now()->subDay()]);
    app(ProjectContext::class)->clear();

    $response = $this->postJson('/api/v1/pay/licensing/license/refresh', licensingActivatePayload())->assertOk();

    $payload = licensingVerifyToken((string) $response->json('data.token'));
    expect($payload['entitled_version'])->toBe('1.4.7')
        ->and($response->json('data.state'))->toBe('updates_expired')
        ->and($license->fresh()->entitled_version)->toBe('1.4.7');
});

// ------------------------------------------------------------- деактивация

test('deactivation frees the slot for a move to a new server', function () {
    licensingActivationLicense(['max_installations' => 1]);
    $this->postJson('/api/v1/pay/licensing/license/activate', licensingActivatePayload())->assertOk();

    $this->postJson('/api/v1/pay/licensing/license/deactivate', [
        'key' => LICENSING_TEST_KEY,
        'install_id' => licensingInstallId(),
    ])->assertOk()->assertJsonPath('data.deactivated', true);

    // переезд: новый install_id проходит в пределах прежнего лимита
    $this->postJson('/api/v1/pay/licensing/license/activate', licensingActivatePayload([
        'install_id' => licensingInstallId('d4'),
        'domain' => 'new.client.example',
    ]))->assertOk();

    $unknown = $this->postJson('/api/v1/pay/licensing/license/deactivate', [
        'key' => LICENSING_TEST_KEY,
        'install_id' => licensingInstallId(),
    ])->assertStatus(404);
    expect($unknown->json('error.code'))->toBe('unknown_installation');
});

// -------------------------------------------------- updates/check (ТЗ 2.4)

function licensingUpdatesCatalog(): void
{
    app(ProjectContext::class)->set('proj-1');
    Release::factory()->version('1.4.7')->create(['released_at' => Carbon::parse('2026-01-10')]);
    Release::factory()->version('1.4.8')->security()->create(['released_at' => Carbon::parse('2026-03-10')]);
    Release::factory()->version('1.5.0')->create(['released_at' => Carbon::parse('2026-04-10')]);
    Release::factory()->version('1.6.0')->create(['released_at' => Carbon::parse('2026-05-10')]);
    app(ProjectContext::class)->clear();
}

test('security patch inside an entitled train stays available after the window', function () {
    // право до 1.4.7, окно закрылось до выхода 1.4.8/1.5.0/1.6.0
    $license = licensingActivationLicense([
        'entitled_version' => null,
        'updates_until' => '2026-02-01',
    ]);
    LicenseInstallation::factory()->create([
        'license_id' => $license->id,
        'install_id' => licensingInstallId(),
        'app_version' => '1.4.7',
    ]);
    licensingUpdatesCatalog();

    $response = $this->postJson('/api/v1/pay/licensing/updates/check', [
        'key' => LICENSING_TEST_KEY,
        'install_id' => licensingInstallId(),
        'app_version' => '1.4.7',
    ])->assertOk();

    // security 1.4.8 доступен, минор 1.5.0 и 1.6.0 — нет; latest_available виден всегда
    expect($response->json('data.latest_entitled'))->toBe('1.4.8')
        ->and($response->json('data.latest_available'))->toBe('1.6.0')
        ->and($response->json('data.image'))->toBe('crm/app-1.4:1.4.8')
        ->and($response->json('data.security_update'))->toBeTrue();
});

test('client behind an expired window sees what it is missing', function () {
    $license = licensingActivationLicense([
        'entitled_version' => '1.4.7',
        'updates_until' => '2026-02-01',
    ]);
    LicenseInstallation::factory()->create([
        'license_id' => $license->id,
        'install_id' => licensingInstallId(),
        'app_version' => '1.4.8',
    ]);
    licensingUpdatesCatalog();

    $response = $this->postJson('/api/v1/pay/licensing/updates/check', [
        'key' => LICENSING_TEST_KEY,
        'install_id' => licensingInstallId(),
        'app_version' => '1.4.8',
    ])->assertOk();

    // обновлений внутри права нет — security_update не сигналится
    expect($response->json('data.latest_entitled'))->toBe('1.4.8')
        ->and($response->json('data.latest_available'))->toBe('1.6.0')
        ->and($response->json('data.security_update'))->toBeFalse();
});

test('window covering the catalog entitles the newest release', function () {
    $license = licensingActivationLicense([
        'entitled_version' => null,
        'updates_until' => '2026-12-31',
    ]);
    LicenseInstallation::factory()->create([
        'license_id' => $license->id,
        'install_id' => licensingInstallId(),
    ]);
    licensingUpdatesCatalog();

    $response = $this->postJson('/api/v1/pay/licensing/updates/check', [
        'key' => LICENSING_TEST_KEY,
        'install_id' => licensingInstallId(),
        'app_version' => '1.4.7',
    ])->assertOk();

    expect($response->json('data.latest_entitled'))->toBe('1.6.0')
        ->and($response->json('data.image'))->toBe('crm/app-1.6:1.6.0')
        ->and($response->json('data.security_update'))->toBeTrue(); // 1.4.8 в доступных обновлениях
});

test('updates check for a revoked license returns 403 license_revoked', function () {
    $license = licensingActivationLicense(['revoked_at' => now()]);
    LicenseInstallation::factory()->create([
        'license_id' => $license->id,
        'install_id' => licensingInstallId(),
    ]);

    $response = $this->postJson('/api/v1/pay/licensing/updates/check', [
        'key' => LICENSING_TEST_KEY,
        'install_id' => licensingInstallId(),
        'app_version' => '1.0.0',
    ])->assertStatus(403);

    expect($response->json('error.code'))->toBe('license_revoked')
        ->and($response->json('error.message'))->toBe('Лицензия отозвана.');
});

test('updates check with an unknown install_id returns 404', function () {
    licensingActivationLicense();

    $this->postJson('/api/v1/pay/licensing/updates/check', [
        'key' => LICENSING_TEST_KEY,
        'install_id' => licensingInstallId('e5'),
        'app_version' => '1.0.0',
    ])->assertStatus(404);
});

// ------------------------------------------------------ офлайн-активация

test('offline activation issues a one-year token within slot limits', function () {
    Carbon::setTestNow('2026-08-28 12:00:00');
    $headers = licensingOperator();
    $license = licensingActivationLicense(['max_installations' => 1]);
    app(ProjectContext::class)->set('proj-1');

    $response = $this->postJson(licensingUrl("licenses/{$license->id}/offline-activation"), [
        'install_id' => licensingInstallId(),
        'domain' => 'closed.contour.example',
        'app_version' => '1.0.0',
    ], $headers)->assertOk();

    $payload = licensingVerifyToken((string) $response->json('data.token'));
    expect($payload['expires_at'] - $payload['issued_at'])->toBe(365 * 86400)
        ->and($payload['domain'])->toBe('closed.contour.example');

    // лимит общий с онлайн-активацией
    $limit = $this->postJson(licensingUrl("licenses/{$license->id}/offline-activation"), [
        'install_id' => licensingInstallId('f6'),
        'domain' => 'second.contour.example',
    ], $headers)->assertStatus(422);
    expect($limit->json('error.details.install_id.0'))->toBe('Installation limit reached.')
        ->and(LicenseInstallation::query()->count())->toBe(1);

    Carbon::setTestNow();
});

// -------------------------------------------------------------- rate limit

test('public licensing endpoints are rate limited', function () {
    for ($i = 0; $i < 60; $i++) {
        $this->postJson('/api/v1/pay/licensing/license/activate', licensingActivatePayload([
            'key' => 'LIC-XXXX-XXXX-XXXX-XXXX',
        ]))->assertStatus(404);
    }

    $this->postJson('/api/v1/pay/licensing/license/activate', licensingActivatePayload([
        'key' => 'LIC-XXXX-XXXX-XXXX-XXXX',
    ]))->assertStatus(429);
});
