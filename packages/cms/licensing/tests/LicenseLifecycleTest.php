<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Licensing\Domain\Models\SigningKey;
use Cms\Shared\Tenant\ProjectContext;

function licensingIssuePayload(Organization $organization, Plan $plan, array $overrides = []): array
{
    return array_merge([
        'organization_id' => $organization->id,
        'plan_id' => $plan->id,
        'expires_at' => now()->addYear()->toIso8601String(),
    ], $overrides);
}

/** @return array{data: string, signature: string} */
function licensingDecodeEnvelope(string $file): array
{
    $envelope = json_decode((string) base64_decode($file, true), true);

    expect($envelope)->toBeArray()->toHaveKeys(['data', 'signature']);

    return $envelope;
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

    // повторный запрос не плодит вторую пару
    $again = $this->getJson(licensingUrl('signing-key'), $headers)->assertOk();
    expect($again->json('data.public_key'))->toBe($publicKey)
        ->and(SigningKey::query()->count())->toBe(1);
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

// ------------------------------------------------------------- 7.2 выпуск

test('license is issued through the endpoint with signed payload', function () {
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
        licensingIssuePayload($organization, $plan),
        $headers,
    )->assertCreated();

    expect($response->json('data.key'))->toMatch('/^LIC-[0-9A-HJKMNP-TV-Z]{5}(-[0-9A-HJKMNP-TV-Z]{5}){4}$/')
        ->and($response->json('data.status'))->toBe('active')
        ->and($response->json('data.organization.name'))->toBe('Acme LLC')
        ->and($response->json('data.plan.code'))->toBe('enterprise');

    $license = License::query()->sole();
    $payload = $license->payload();
    expect($payload['license_id'])->toBe($license->id)
        ->and($payload['key'])->toBe($license->key)
        ->and($payload['organization'])->toBe('Acme LLC')
        ->and($payload['plan'])->toBe('enterprise')
        ->and($payload['features'])->toBe(['api-access', 'audit-log']);
});

test('issuing without manage permission is forbidden', function () {
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create();
    $plan = Plan::factory()->create();
    $headers = licensingOperator(permissions: ['pay.licensing.view']);

    $this->postJson(licensingUrl('licenses'), licensingIssuePayload($organization, $plan), $headers)
        ->assertForbidden();
});

test('payload features are fixed at issue time', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create();
    $plan = Plan::factory()->create();
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API']);

    $this->postJson(licensingUrl('licenses'), licensingIssuePayload($organization, $plan), $headers)->assertCreated();

    // новая базовая фича после выпуска в payload не попадает
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'sso', 'name' => 'SSO']);

    expect(License::query()->sole()->payload()['features'])->toBe(['api-access']);
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

// ---------------------------------------------------- 7.3 файл, отзыв, список

test('license file signature verifies against the project public key', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create();
    $plan = Plan::factory()->create();

    $licenseId = $this->postJson(licensingUrl('licenses'), licensingIssuePayload($organization, $plan), $headers)
        ->json('data.id');
    $file = $this->get(licensingUrl("licenses/{$licenseId}/file"), $headers)->assertOk()->getContent();
    $publicKey = base64_decode((string) $this->getJson(licensingUrl('signing-key'), $headers)->json('data.public_key'), true);

    $envelope = licensingDecodeEnvelope((string) $file);

    // подпись data проверяется публичным ключом того же проекта
    expect(sodium_crypto_sign_verify_detached(
        (string) base64_decode($envelope['signature'], true),
        $envelope['data'],
        (string) $publicKey,
    ))->toBeTrue();

    // изменённый байт data роняет проверку офлайн
    $tampered = $envelope['data'];
    $tampered[5] = $tampered[5] === 'A' ? 'B' : 'A';
    expect(sodium_crypto_sign_verify_detached(
        (string) base64_decode($envelope['signature'], true),
        $tampered,
        (string) $publicKey,
    ))->toBeFalse();
});

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

test('license list filters by organization and computed status', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create();
    $active = License::factory()->create(['organization_id' => $organization->id]);
    $expired = License::factory()->expired()->create(['organization_id' => $organization->id]);
    License::factory()->revoked()->create(); // другая организация

    $byOrganization = $this->getJson(
        licensingUrl("licenses?filter[organization_id]={$organization->id}"),
        $headers,
    )->assertOk();
    expect(collect($byOrganization->json('data'))->pluck('id')->sort()->values()->all())
        ->toBe(collect([$active->id, $expired->id])->sort()->values()->all());

    $activeOnly = $this->getJson(licensingUrl('licenses?filter[status]=active'), $headers)->assertOk();
    expect($activeOnly->json('data'))->toHaveCount(1)
        ->and($activeOnly->json('data.0.id'))->toBe($active->id);

    $revokedOnly = $this->getJson(licensingUrl('licenses?filter[status]=revoked'), $headers)->assertOk();
    expect($revokedOnly->json('data'))->toHaveCount(1)
        ->and($revokedOnly->json('data.0.status'))->toBe('revoked');
});

// ------------------------------------------------- 7.4 публичная валидация

test('invalid keys are indistinguishable: unknown, revoked and expired', function () {
    app(ProjectContext::class)->set('proj-1');
    $revoked = License::factory()->revoked()->create();
    $expired = License::factory()->expired()->create();
    app(ProjectContext::class)->clear();

    $unknown = $this->postJson('/api/v1/pay/licensing/validate', ['key' => 'LIC-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX'])
        ->assertOk()->json();
    $revokedBody = $this->postJson('/api/v1/pay/licensing/validate', ['key' => $revoked->key])->assertOk()->json();
    $expiredBody = $this->postJson('/api/v1/pay/licensing/validate', ['key' => $expired->key])->assertOk()->json();

    expect($unknown)->toBe(['data' => ['status' => 'invalid']])
        ->and($revokedBody)->toBe($unknown)
        ->and($expiredBody)->toBe($unknown);
});

test('active key validation returns plan code, features and expiry without pii', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create(['name' => 'Acme LLC', 'email' => 'ivan@acme.example']);
    $plan = Plan::factory()->create(['code' => 'enterprise']);
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API']);
    $key = $this->postJson(licensingUrl('licenses'), licensingIssuePayload($organization, $plan), $headers)
        ->json('data.key');
    app(ProjectContext::class)->clear();

    $response = $this->postJson('/api/v1/pay/licensing/validate', ['key' => $key])->assertOk();

    expect($response->json('data.status'))->toBe('active')
        ->and($response->json('data.plan'))->toBe('enterprise')
        ->and($response->json('data.features'))->toBe(['api-access'])
        ->and($response->json('data.expires_at'))->not->toBeNull();

    $raw = (string) $response->getContent();
    expect($raw)->not->toContain('Acme LLC')->not->toContain('acme.example');
});

test('validation endpoint is rate limited', function () {
    for ($i = 0; $i < 30; $i++) {
        $this->postJson('/api/v1/pay/licensing/validate', ['key' => 'LIC-AAAAA-AAAAA-AAAAA-AAAAA-AAAAA'])
            ->assertOk();
    }

    $this->postJson('/api/v1/pay/licensing/validate', ['key' => 'LIC-AAAAA-AAAAA-AAAAA-AAAAA-AAAAA'])
        ->assertStatus(429);
});
