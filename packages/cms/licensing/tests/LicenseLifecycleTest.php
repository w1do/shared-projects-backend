<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\LicenseInstallation;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Licensing\Domain\Models\Release;
use Cms\Licensing\Domain\Models\SigningKey;
use Cms\Licensing\Domain\ValueObjects\LicenseKey;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Crypt;

function licensingIssuePayload(Organization $organization, Plan $plan, array $overrides = []): array
{
    return array_merge([
        'organization_id' => $organization->id,
        'plan_id' => $plan->id,
        'updates_until' => now()->addYear()->toDateString(),
    ], $overrides);
}

// ------------------------------------------------------------- 7.1 подпись

test('signing key pair is created lazily on first public key request', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    expect(SigningKey::query()->count())->toBe(0);

    $response = $this->getJson(licensingUrl('signing-key'), $headers)->assertOk();

    $publicKey = $response->json('data.public_key');
    expect(strlen((string) base64_decode($publicKey, true)))->toBe(SODIUM_CRYPTO_SIGN_PUBLICKEYBYTES)
        ->and(SigningKey::query()->count())->toBe(1);

    $again = $this->getJson(licensingUrl('signing-key'), $headers)->assertOk();
    expect($again->json('data.public_key'))->toBe($publicKey)
        ->and(SigningKey::query()->count())->toBe(1);
});

// ------------------------------------------------------------- 7.2 выпуск

test('license is issued with a one-time key and hash-only storage', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create(['name' => 'Acme LLC']);
    $plan = Plan::factory()->create(['code' => 'enterprise']);
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API']);
    $plan->features()->create([
        'project_id' => 'proj-1', 'code' => 'audit-log', 'name' => 'Audit',
        'organization_id' => $organization->id,
    ]);

    $response = $this->postJson(
        licensingUrl('licenses'),
        licensingIssuePayload($organization, $plan, ['max_installations' => 3, 'note' => 'VIP']),
        $headers,
    )->assertCreated();

    $key = (string) $response->json('data.key');
    expect($key)->toMatch('/^LIC(-[A-HJ-NP-Z2-9]{4}){4}$/')
        ->and($response->json('data.status'))->toBe('active')
        ->and($response->json('data.key_prefix'))->toBe(substr($key, 0, 8))
        ->and($response->json('data.edition'))->toBe('enterprise')
        ->and($response->json('data.features'))->toBe(['api-access', 'audit-log'])
        ->and($response->json('data.max_installations'))->toBe(3)
        ->and($response->json('data.active_installations'))->toBe(0)
        ->and($response->json('data.reveal_available'))->toBeFalse()
        ->and($response->json('data.organization.name'))->toBe('Acme LLC');

    // в хранилище только хэш и префикс — plaintext и шифрокопии нет
    $license = License::query()->sole();
    expect($license->key_hash)->toBe(LicenseKey::fromInput($key)->hash())
        ->and($license->key_prefix)->toBe(substr($key, 0, 8))
        ->and($license->key_encrypted)->toBeNull()
        ->and((string) json_encode($license->getAttributes()))->not->toContain($key);
});

test('entitlements are snapshotted at issue time', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create();
    $plan = Plan::factory()->create(['code' => 'pro']);
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API']);

    $this->postJson(licensingUrl('licenses'), licensingIssuePayload($organization, $plan), $headers)->assertCreated();

    // новая базовая фича после выпуска в снимок не попадает
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'sso', 'name' => 'SSO']);

    expect(License::query()->sole()->features)->toBe(['api-access']);
});

test('entitled version defaults to the latest project release at issue time', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    Release::factory()->version('1.4.7')->create(['released_at' => now()->subDay()]);
    $organization = Organization::factory()->create();
    $plan = Plan::factory()->create();

    $auto = $this->postJson(licensingUrl('licenses'), licensingIssuePayload($organization, $plan), $headers)
        ->assertCreated();
    $explicit = $this->postJson(
        licensingUrl('licenses'),
        licensingIssuePayload($organization, $plan, ['entitled_version' => '1.2.0']),
        $headers,
    )->assertCreated();

    expect($auto->json('data.entitled_version'))->toBe('1.4.7')
        ->and($explicit->json('data.entitled_version'))->toBe('1.2.0');
});

test('issuing without manage permission is forbidden', function () {
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create();
    $plan = Plan::factory()->create();
    $headers = licensingOperator(permissions: ['pay.licensing.view']);

    $this->postJson(licensingUrl('licenses'), licensingIssuePayload($organization, $plan), $headers)
        ->assertForbidden();
});

test('issuing for a foreign organization or plan is impossible', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-2');
    $foreignOrganization = Organization::factory()->create(['project_id' => 'proj-2']);
    $foreignPlan = Plan::factory()->create(['project_id' => 'proj-2']);
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create();
    $plan = Plan::factory()->create();

    $this->postJson(licensingUrl('licenses'), licensingIssuePayload($foreignOrganization, $plan), $headers)
        ->assertNotFound();
    $this->postJson(licensingUrl('licenses'), licensingIssuePayload($organization, $foreignPlan), $headers)
        ->assertNotFound();
});

// ---------------------------------------------------------- 7.3 продление

test('renew moves the updates window forward and raises the entitled version', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->updatesExpired()->create(['entitled_version' => '1.2.0']);
    Release::factory()->version('1.4.7')->create(['released_at' => now()->subDay()]);

    $response = $this->postJson(
        licensingUrl("licenses/{$license->id}/renew"),
        ['updates_until' => now()->addYear()->toDateString()],
        $headers,
    )->assertOk();

    expect($response->json('data.updates_until'))->toBe(now()->addYear()->toDateString())
        ->and($response->json('data.entitled_version'))->toBe('1.4.7')
        ->and($response->json('data.key_prefix'))->toBe($license->key_prefix); // ключ прежний
});

test('renew rejects a date not later than the current window', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->create(['updates_until' => now()->addYear()->toDateString()]);

    $response = $this->postJson(
        licensingUrl("licenses/{$license->id}/renew"),
        ['updates_until' => now()->addMonth()->toDateString()],
        $headers,
    )->assertStatus(422);

    expect($response->json('error.details.updates_until.0'))
        ->toBe('Renewal date must be later than the current updates window end.')
        ->and($license->fresh()->updates_until->toDateString())->toBe(now()->addYear()->toDateString());
});

test('revoked license cannot be renewed', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->revoked()->create();

    $response = $this->postJson(
        licensingUrl("licenses/{$license->id}/renew"),
        ['updates_until' => now()->addYears(2)->toDateString()],
        $headers,
    )->assertStatus(422);

    expect($response->json('error.details.license.0'))->toBe('Revoked license cannot be renewed.')
        ->and($license->fresh()->status()->value)->toBe('revoked');
});

// ------------------------------------------------------ 7.4 показ ключа (Д8)

test('encrypted key of an auto-issued license is revealed exactly once', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->withKey('LIC-ABCD-EFGH-JKLM-NPQR')->create([
        'key_encrypted' => Crypt::encryptString('LIC-ABCD-EFGH-JKLM-NPQR'),
    ]);

    $first = $this->postJson(licensingUrl("licenses/{$license->id}/reveal-key"), [], $headers)->assertOk();
    expect($first->json('data.key'))->toBe('LIC-ABCD-EFGH-JKLM-NPQR')
        ->and($license->fresh()->key_encrypted)->toBeNull();

    $second = $this->postJson(licensingUrl("licenses/{$license->id}/reveal-key"), [], $headers)->assertStatus(422);
    expect($second->json('error.details.license.0'))->toBe('License key is no longer available.');
});

test('manually issued license has no key to reveal', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->create();

    $this->postJson(licensingUrl("licenses/{$license->id}/reveal-key"), [], $headers)->assertStatus(422);
});

// ---------------------------------------------------- 7.5 отзыв, список

test('revoke is irreversible and repeated revoke is rejected', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->create();

    $this->postJson(licensingUrl("licenses/{$license->id}/revoke"), [], $headers)
        ->assertOk()
        ->assertJsonPath('data.status', 'revoked');

    $response = $this->postJson(licensingUrl("licenses/{$license->id}/revoke"), [], $headers)->assertStatus(422);

    expect($response->json('error.details.license.0'))->toBe('License is already revoked.')
        ->and($license->fresh()->revoked_at)->not->toBeNull();
});

test('license list filters by organization and status and shows only prefixes', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create();
    $active = License::factory()->withKey('LIC-AAAA-AAAA-AAAA-AAAA')->create(['organization_id' => $organization->id]);
    $revoked = License::factory()->revoked()->create();

    $byOrganization = $this->getJson(
        licensingUrl("licenses?filter[organization_id]={$organization->id}"),
        $headers,
    )->assertOk();
    expect(collect($byOrganization->json('data'))->pluck('id')->all())->toBe([$active->id]);

    $activeOnly = $this->getJson(licensingUrl('licenses?filter[status]=active'), $headers)->assertOk();
    expect($activeOnly->json('data'))->toHaveCount(1)
        ->and($activeOnly->json('data.0.id'))->toBe($active->id);

    $revokedOnly = $this->getJson(licensingUrl('licenses?filter[status]=revoked'), $headers)->assertOk();
    expect($revokedOnly->json('data'))->toHaveCount(1)
        ->and($revokedOnly->json('data.0.id'))->toBe($revoked->id);

    // полного ключа нет ни в одном ответе
    expect((string) $byOrganization->getContent())->not->toContain('LIC-AAAA-AAAA-AAAA-AAAA')
        ->and($byOrganization->json('data.0.key_prefix'))->toBe('LIC-AAAA');
});

test('license show includes installations and active slot count', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->create(['max_installations' => 3]);
    LicenseInstallation::factory()->create(['license_id' => $license->id, 'domain' => 'a.example']);
    LicenseInstallation::factory()->revoked()->create(['license_id' => $license->id, 'domain' => 'b.example']);

    $response = $this->getJson(licensingUrl("licenses/{$license->id}"), $headers)->assertOk();

    expect($response->json('data.active_installations'))->toBe(1)
        ->and($response->json('data.installations'))->toHaveCount(2)
        ->and(collect($response->json('data.installations'))->pluck('status')->sort()->values()->all())
        ->toBe(['active', 'revoked']);
});

// ----------------------------------------------- 7.6 установки: список и отзыв

test('installations list filters by app_version below a given one', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->create(['max_installations' => 5]);
    LicenseInstallation::factory()->create(['license_id' => $license->id, 'app_version' => '1.2.0']);
    LicenseInstallation::factory()->create(['license_id' => $license->id, 'app_version' => '1.10.0']);
    LicenseInstallation::factory()->create(['license_id' => $license->id, 'app_version' => '1.4.7']);

    $all = $this->getJson(licensingUrl("licenses/{$license->id}/installations"), $headers)->assertOk();
    expect($all->json('data'))->toHaveCount(3);

    $behind = $this->getJson(
        licensingUrl("licenses/{$license->id}/installations?filter[app_version_below]=1.4.7"),
        $headers,
    )->assertOk();
    expect(collect($behind->json('data'))->pluck('app_version')->all())->toBe(['1.2.0']);
});

test('operator revokes a single installation and frees the slot', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->create();
    $installation = LicenseInstallation::factory()->create(['license_id' => $license->id]);

    $response = $this->postJson(licensingUrl("installations/{$installation->id}/revoke"), [], $headers)->assertOk();
    expect($response->json('data.status'))->toBe('revoked')
        ->and($license->activeInstallations()->count())->toBe(0);

    $again = $this->postJson(licensingUrl("installations/{$installation->id}/revoke"), [], $headers)->assertStatus(422);
    expect($again->json('error.details.installation.0'))->toBe('Installation is already revoked.');
});

test('foreign project installation is not revocable', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-2');
    $foreign = LicenseInstallation::factory()->create([
        'license_id' => License::factory()->create(['project_id' => 'proj-2'])->id,
    ]);
    app(ProjectContext::class)->set('proj-1');

    $this->postJson(licensingUrl("installations/{$foreign->id}/revoke"), [], $headers)->assertNotFound();
});

// ------------------------------------------------- 7.7 удалённые v1-маршруты

test('removed v1 endpoints validate and file are gone', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->create();

    $this->postJson('/api/v1/pay/licensing/validate', ['key' => 'LIC-AAAA-AAAA-AAAA-AAAA'])->assertNotFound();
    $this->get(licensingUrl("licenses/{$license->id}/file"), $headers)->assertNotFound();
});

test('private key never appears in api responses', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create();
    $plan = Plan::factory()->create();

    $keyResponse = $this->getJson(licensingUrl('signing-key'), $headers)->assertOk();
    $issueResponse = $this->postJson(
        licensingUrl('licenses'),
        licensingIssuePayload($organization, $plan),
        $headers,
    )->assertCreated();
    $listResponse = $this->getJson(licensingUrl('licenses'), $headers)->assertOk();

    $secret = SigningKey::query()->sole()->secret_key; // расшифрованный cast'ом

    foreach ([$keyResponse, $issueResponse, $listResponse] as $response) {
        $raw = (string) $response->getContent();
        expect($raw)->not->toContain($secret)
            ->and($raw)->not->toContain('secret_key');
    }
});
