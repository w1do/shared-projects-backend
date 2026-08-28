<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\LicenseInstallation;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Licensing\Domain\Models\Release;
use Cms\Licensing\Domain\Models\SigningKey;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Crypt;

/**
 * Характеризационные снимки admin-API licensing (guard 0.3): каждый маршрут
 * licensing/* числится в payRouteCoverageCoveredPairs() со снимком здесь.
 * Фикстуры — только явные значения: faker в снимках недопустим.
 */
function licensingContractOrganization(array $attrs = []): Organization
{
    app(ProjectContext::class)->set('proj-1');

    return Organization::factory()->create(array_merge([
        'name' => 'Acme LLC',
        'contact_first_name' => 'Ivan',
        'contact_last_name' => 'Petrov',
        'phone' => '+79000000000',
        'email' => 'ivan@acme.example',
        'telegram' => '@acme',
        'activity' => 'E-commerce',
        'employees_count' => 42,
        'usage_purpose' => 'Self-hosted shop',
    ], $attrs));
}

function licensingContractPlan(array $attrs = []): Plan
{
    app(ProjectContext::class)->set('proj-1');

    return Plan::factory()->create(array_merge([
        'code' => 'enterprise',
        'name' => 'Enterprise',
        'price_minor' => 49900,
        'currency' => 'RUB',
        'interval' => 'month',
    ], $attrs));
}

// ------------------------------------------------------------ organizations

test('contract: licensing organizations index', function () {
    $headers = licensingOperator();
    licensingContractOrganization();

    ResponseSnapshot::assertMatches(
        $this->getJson(licensingUrl('organizations'), $headers),
        'admin-organizations-index',
    );
});

test('contract: licensing organizations index forbidden', function () {
    $headers = licensingOperator(permissions: ['pay.plans.view']);

    ResponseSnapshot::assertMatches(
        $this->getJson(licensingUrl('organizations'), $headers),
        'admin-organizations-index-403',
    );
});

test('contract: licensing organization show', function () {
    $headers = licensingOperator();
    $organization = licensingContractOrganization();

    ResponseSnapshot::assertMatches(
        $this->getJson(licensingUrl("organizations/{$organization->id}"), $headers),
        'admin-organization-show',
    );
});

test('contract: licensing organization store', function () {
    $headers = licensingOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl('organizations'), [
            'name' => 'Acme LLC',
            'contact_first_name' => 'Ivan',
            'contact_last_name' => 'Petrov',
            'email' => 'ivan@acme.example',
        ], $headers),
        'admin-organization-store',
    );
});

test('contract: licensing organization store missing required', function () {
    $headers = licensingOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl('organizations'), ['phone' => '+79000000000'], $headers),
        'admin-organization-store-422',
    );
});

test('contract: licensing organization update', function () {
    $headers = licensingOperator();
    $organization = licensingContractOrganization();

    ResponseSnapshot::assertMatches(
        $this->putJson(licensingUrl("organizations/{$organization->id}"), [
            'name' => 'Acme LLC',
            'contact_first_name' => 'Ivan',
            'contact_last_name' => 'Petrov',
            'email' => 'ivan@acme.example',
            'employees_count' => 50,
        ], $headers),
        'admin-organization-update',
    );
});

test('contract: licensing organization delete', function () {
    $headers = licensingOperator();
    $organization = licensingContractOrganization();

    ResponseSnapshot::assertMatches(
        $this->deleteJson(licensingUrl("organizations/{$organization->id}"), [], $headers),
        'admin-organization-delete',
    );
});

test('contract: licensing organization delete with licenses', function () {
    $headers = licensingOperator();
    $organization = licensingContractOrganization();
    $plan = licensingContractPlan();
    License::factory()->create(['organization_id' => $organization->id, 'plan_id' => $plan->id]);

    ResponseSnapshot::assertMatches(
        $this->deleteJson(licensingUrl("organizations/{$organization->id}"), [], $headers),
        'admin-organization-delete-422',
    );
});

// -------------------------------------------------------------------- plans

test('contract: licensing plans index', function () {
    $headers = licensingOperator();
    $plan = licensingContractPlan();
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API access']);

    ResponseSnapshot::assertMatches(
        $this->getJson(licensingUrl('plans'), $headers),
        'admin-license-plans-index',
    );
});

test('contract: licensing plan show', function () {
    $headers = licensingOperator();
    $plan = licensingContractPlan();
    $organization = licensingContractOrganization();
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API access']);
    $plan->features()->create([
        'project_id' => 'proj-1', 'code' => 'audit-log', 'name' => 'Audit log',
        'organization_id' => $organization->id,
    ]);

    ResponseSnapshot::assertMatches(
        $this->getJson(licensingUrl("plans/{$plan->id}"), $headers),
        'admin-license-plan-show',
    );
});

test('contract: licensing plan store', function () {
    $headers = licensingOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl('plans'), [
            'code' => 'enterprise', 'name' => 'Enterprise',
            'price_minor' => 49900, 'currency' => 'RUB', 'interval' => 'month',
        ], $headers),
        'admin-license-plan-store',
    );
});

test('contract: licensing plan store partial price', function () {
    $headers = licensingOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl('plans'), [
            'code' => 'enterprise', 'name' => 'Enterprise', 'price_minor' => 49900,
        ], $headers),
        'admin-license-plan-store-422-partial-price',
    );
});

test('contract: licensing plan store code taken', function () {
    $headers = licensingOperator();
    licensingContractPlan();

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl('plans'), [
            'code' => 'enterprise', 'name' => 'Enterprise Again',
        ], $headers),
        'admin-license-plan-store-422-code-taken',
    );
});

test('contract: licensing plan update', function () {
    $headers = licensingOperator();
    $plan = licensingContractPlan();

    ResponseSnapshot::assertMatches(
        $this->putJson(licensingUrl("plans/{$plan->id}"), [
            'code' => 'enterprise', 'name' => 'Enterprise v2',
        ], $headers),
        'admin-license-plan-update',
    );
});

test('contract: licensing plan delete', function () {
    $headers = licensingOperator();
    $plan = licensingContractPlan();

    ResponseSnapshot::assertMatches(
        $this->deleteJson(licensingUrl("plans/{$plan->id}"), [], $headers),
        'admin-license-plan-delete',
    );
});

test('contract: licensing plan delete with licenses', function () {
    $headers = licensingOperator();
    $license = License::factory()->create([
        'organization_id' => licensingContractOrganization()->id,
        'plan_id' => licensingContractPlan()->id,
    ]);

    ResponseSnapshot::assertMatches(
        $this->deleteJson(licensingUrl("plans/{$license->plan_id}"), [], $headers),
        'admin-license-plan-delete-422',
    );
});

// ----------------------------------------------------------------- licenses

/** Лицензия с фиксированными ключом и entitlements: снимки требуют детерминизма. */
function licensingContractLicense(array $attrs = []): License
{
    app(ProjectContext::class)->set('proj-1');

    return License::factory()->withKey('LIC-ABCD-EFGH-JKLM-NPQR')->create(array_merge([
        'organization_id' => licensingContractOrganization()->id,
        'plan_id' => licensingContractPlan()->id,
        'edition' => 'enterprise',
        'features' => ['api-access'],
        'entitled_version' => '1.4.7',
        'updates_until' => '2030-01-01',
        'max_installations' => 3,
    ], $attrs));
}

function licensingContractInstallation(License $license, array $attrs = []): LicenseInstallation
{
    return LicenseInstallation::factory()->create(array_merge([
        'license_id' => $license->id,
        'install_id' => str_repeat('9f2c', 16),
        'domain' => 'crm.client.example',
        'app_version' => '1.4.2',
        'last_ip' => '10.0.0.1',
    ], $attrs));
}

test('contract: licensing licenses index', function () {
    $headers = licensingOperator();
    licensingContractLicense();

    ResponseSnapshot::assertMatches(
        $this->getJson(licensingUrl('licenses'), $headers),
        'admin-licenses-index',
    );
});

test('contract: licensing license show with installations', function () {
    $headers = licensingOperator();
    $license = licensingContractLicense();
    licensingContractInstallation($license);

    ResponseSnapshot::assertMatches(
        $this->getJson(licensingUrl("licenses/{$license->id}"), $headers),
        'admin-license-show',
    );
});

test('contract: licensing license issue returns the key once', function () {
    $headers = licensingOperator();
    $organization = licensingContractOrganization();
    $plan = licensingContractPlan();

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl('licenses'), [
            'organization_id' => $organization->id,
            'plan_id' => $plan->id,
            'updates_until' => '2030-01-01',
            'max_installations' => 3,
            'entitled_version' => '1.4.7',
        ], $headers),
        'admin-license-issue',
    );
});

test('contract: licensing license renew and rejected renew', function () {
    $headers = licensingOperator();
    $license = licensingContractLicense();

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl("licenses/{$license->id}/renew"), ['updates_until' => '2031-01-01'], $headers),
        'admin-license-renew',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl("licenses/{$license->id}/renew"), ['updates_until' => '2030-01-01'], $headers),
        'admin-license-renew-422',
    );
});

test('contract: licensing reveal key once then 422', function () {
    $headers = licensingOperator();
    $license = licensingContractLicense([
        'key_encrypted' => Crypt::encryptString('LIC-ABCD-EFGH-JKLM-NPQR'),
    ]);

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl("licenses/{$license->id}/reveal-key"), [], $headers),
        'admin-license-reveal-key',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl("licenses/{$license->id}/reveal-key"), [], $headers),
        'admin-license-reveal-key-422',
    );
});

test('contract: licensing license revoke and repeated revoke', function () {
    $headers = licensingOperator();
    $license = licensingContractLicense();

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl("licenses/{$license->id}/revoke"), [], $headers),
        'admin-license-revoke',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl("licenses/{$license->id}/revoke"), [], $headers),
        'admin-license-revoke-422',
    );
});

test('contract: licensing offline activation', function () {
    $headers = licensingOperator();
    $license = licensingContractLicense();

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl("licenses/{$license->id}/offline-activation"), [
            'install_id' => str_repeat('9f2c', 16),
            'domain' => 'closed.contour.example',
            'app_version' => '1.4.2',
        ], $headers),
        'admin-license-offline-activation',
    );
});

test('contract: licensing installations index and revoke', function () {
    $headers = licensingOperator();
    $license = licensingContractLicense();
    $installation = licensingContractInstallation($license);

    ResponseSnapshot::assertMatches(
        $this->getJson(licensingUrl("licenses/{$license->id}/installations"), $headers),
        'admin-installations-index',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl("installations/{$installation->id}/revoke"), [], $headers),
        'admin-installation-revoke',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl("installations/{$installation->id}/revoke"), [], $headers),
        'admin-installation-revoke-422',
    );
});

test('contract: licensing signing key', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    // фиксированная пара: значение public_key в снимке — литерал
    SigningKey::create([
        'public_key' => 'cHVibGljLWtleS1maXhlZA==',
        'secret_key' => 'c2VjcmV0LWtleS1maXhlZA==',
    ]);

    ResponseSnapshot::assertMatches(
        $this->getJson(licensingUrl('signing-key'), $headers),
        'admin-signing-key',
    );
});

// ----------------------------------------------------------------- releases

test('contract: licensing releases index and crud', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $release = Release::factory()->version('1.4.7')->create([
        'released_at' => '2026-01-10 00:00:00',
        'changelog_url' => 'https://changelog.example/1.4.7',
    ]);

    ResponseSnapshot::assertMatches(
        $this->getJson(licensingUrl('releases'), $headers),
        'admin-releases-index',
    );

    ResponseSnapshot::assertMatches(
        $this->getJson(licensingUrl("releases/{$release->id}"), $headers),
        'admin-release-show',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl('releases'), [
            'version' => '1.4.8',
            'train' => '1.4',
            'repository' => 'crm/app-1.4',
            'released_at' => '2026-03-10T00:00:00+00:00',
            'is_security' => true,
        ], $headers),
        'admin-release-store',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl('releases'), [
            'version' => '1.4.7',
            'train' => '1.4',
            'repository' => 'crm/app-1.4',
            'released_at' => '2026-03-10T00:00:00+00:00',
        ], $headers),
        'admin-release-store-422-version-taken',
    );

    ResponseSnapshot::assertMatches(
        $this->putJson(licensingUrl("releases/{$release->id}"), [
            'version' => '1.4.7',
            'train' => '1.4',
            'repository' => 'crm/app-1.4',
            'released_at' => '2026-01-10T00:00:00+00:00',
            'is_security' => true,
        ], $headers),
        'admin-release-update',
    );

    ResponseSnapshot::assertMatches(
        $this->deleteJson(licensingUrl("releases/{$release->id}"), [], $headers),
        'admin-release-delete',
    );
});

// ------------------------------------------------- публичный контракт (ТЗ 1.7)

test('contract: public activate, refresh, deactivate and updates check', function () {
    $license = licensingContractLicense();
    app(ProjectContext::class)->set('proj-1');
    Release::factory()->version('1.4.7')->create(['released_at' => '2026-01-10 00:00:00']);
    app(ProjectContext::class)->clear();

    $payload = [
        'key' => 'LIC-ABCD-EFGH-JKLM-NPQR',
        'install_id' => str_repeat('9f2c', 16),
        'domain' => 'crm.client.example',
        'app_version' => '1.4.2',
    ];

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/licensing/license/activate', $payload),
        'public-license-activate',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/licensing/license/refresh', $payload),
        'public-license-refresh',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/licensing/updates/check', [
            'key' => $payload['key'],
            'install_id' => $payload['install_id'],
            'app_version' => '1.4.2',
        ]),
        'public-updates-check',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/licensing/license/deactivate', [
            'key' => $payload['key'],
            'install_id' => $payload['install_id'],
        ]),
        'public-license-deactivate',
    );
});

test('contract: public activation errors', function () {
    $license = licensingContractLicense(['max_installations' => 1]);
    licensingContractInstallation($license);
    app(ProjectContext::class)->clear();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/licensing/license/activate', [
            'key' => 'LIC-XXXX-XXXX-XXXX-XXXX',
            'install_id' => str_repeat('ab', 32),
            'domain' => 'crm.client.example',
            'app_version' => '1.0.0',
        ]),
        'public-license-activate-404',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/licensing/license/activate', [
            'key' => 'LIC-ABCD-EFGH-JKLM-NPQR',
            'install_id' => str_repeat('cd', 32),
            'domain' => 'crm.client.example',
            'app_version' => '1.0.0',
        ]),
        'public-license-activate-409-limit',
    );
});

test('contract: removed v1 endpoints respond 404', function () {
    $headers = licensingOperator();
    $license = licensingContractLicense();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/licensing/validate', ['key' => 'LIC-ABCD-EFGH-JKLM-NPQR']),
        'public-validate-removed-404',
    );

    ResponseSnapshot::assertMatches(
        $this->getJson(licensingUrl("licenses/{$license->id}/file"), $headers),
        'admin-license-file-removed-404',
    );
});

// ------------------------------------------------------------------ features

test('contract: licensing plan feature store', function () {
    $headers = licensingOperator();
    $plan = licensingContractPlan();

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl("plans/{$plan->id}/features"), [
            'code' => 'api-access', 'name' => 'API access',
        ], $headers),
        'admin-license-plan-feature-store',
    );
});

test('contract: licensing plan feature store duplicate', function () {
    $headers = licensingOperator();
    $plan = licensingContractPlan();
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API access']);

    ResponseSnapshot::assertMatches(
        $this->postJson(licensingUrl("plans/{$plan->id}/features"), [
            'code' => 'api-access', 'name' => 'API access',
        ], $headers),
        'admin-license-plan-feature-store-422',
    );
});

test('contract: licensing plan feature update', function () {
    $headers = licensingOperator();
    $plan = licensingContractPlan();
    $feature = $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API access']);

    ResponseSnapshot::assertMatches(
        $this->putJson(licensingUrl("plans/{$plan->id}/features/{$feature->id}"), [
            'code' => 'api-access', 'name' => 'API access v2',
        ], $headers),
        'admin-license-plan-feature-update',
    );
});

test('contract: licensing plan feature delete', function () {
    $headers = licensingOperator();
    $plan = licensingContractPlan();
    $feature = $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API access']);

    ResponseSnapshot::assertMatches(
        $this->deleteJson(licensingUrl("plans/{$plan->id}/features/{$feature->id}"), [], $headers),
        'admin-license-plan-feature-delete',
    );
});
