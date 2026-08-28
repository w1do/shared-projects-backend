<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Enums\LicenseStatus;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Licensing\Domain\Models\Release;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
});

// ------------------------------------------------ статус: только active/revoked

test('license status derives from revoked_at and expired window keeps it active', function () {
    $active = License::factory()->create();
    $expiredWindow = License::factory()->updatesExpired()->create();
    $revoked = License::factory()->revoked()->create();

    expect($active->status())->toBe(LicenseStatus::Active)
        ->and($expiredWindow->status())->toBe(LicenseStatus::Active) // лицензия бессрочна (Д2)
        ->and($expiredWindow->updatesExpired())->toBeTrue()
        ->and($revoked->status())->toBe(LicenseStatus::Revoked);
});

test('activation state hints licensed, updates_expired and revoked', function () {
    expect(License::factory()->create()->activationState())->toBe('licensed')
        ->and(License::factory()->updatesExpired()->create()->activationState())->toBe('updates_expired')
        ->and(License::factory()->revoked()->create()->activationState())->toBe('revoked');
});

// ------------------------------------------- эффективная entitled_version (Д5)

test('release inside the updates window raises the effective entitled version', function () {
    $license = License::factory()->create([
        'entitled_version' => '1.2.0',
        'updates_until' => now()->addMonth()->toDateString(),
    ]);
    Release::factory()->version('1.4.7')->create(['released_at' => now()->subDay()]);

    expect($license->effectiveEntitledVersion())->toBe('1.4.7');

    $license->raiseEntitledVersion();
    expect($license->fresh()->entitled_version)->toBe('1.4.7');
});

test('release after the updates window does not raise and never lowers the version', function () {
    $license = License::factory()->create([
        'entitled_version' => '1.4.7',
        'updates_until' => now()->subMonth()->toDateString(),
    ]);
    Release::factory()->version('1.6.0')->create(['released_at' => now()->subDay()]);

    expect($license->effectiveEntitledVersion())->toBe('1.4.7');

    $license->raiseEntitledVersion();
    expect($license->fresh()->entitled_version)->toBe('1.4.7');
});

test('effective version falls back to the catalog when license has none', function () {
    $license = License::factory()->create([
        'entitled_version' => null,
        'updates_until' => now()->addMonth()->toDateString(),
    ]);

    expect($license->effectiveEntitledVersion())->toBeNull();

    Release::factory()->version('1.0.5')->create(['released_at' => now()->subDay()]);
    expect($license->effectiveEntitledVersion())->toBe('1.0.5');
});

test('semver comparison is numeric, not lexicographic', function () {
    $license = License::factory()->create([
        'entitled_version' => '1.9.0',
        'updates_until' => now()->addMonth()->toDateString(),
    ]);
    Release::factory()->version('1.10.0')->create(['released_at' => now()->subDay()]);

    expect($license->effectiveEntitledVersion())->toBe('1.10.0');
});

// ----------------------------------------------------- план как предмет подписки

test('license plan with full price triple is subscribable', function () {
    $plan = Plan::factory()->priced(49900, 'RUB', 'month')->create();

    expect($plan->hasPrice())->toBeTrue()
        ->and($plan->subscriptionPrice()->amountMinor)->toBe(49900)
        ->and($plan->subscriptionPrice()->currency->code)->toBe('RUB')
        ->and($plan->subscriptionCode())->toBe($plan->code)
        ->and($plan->subscriptionInterval()->m)->toBe(1);
});

test('license plan without price rejects subscription pricing', function () {
    $plan = Plan::factory()->create();

    expect($plan->hasPrice())->toBeFalse();
    $plan->subscriptionPrice();
})->throws(ValidationException::class);

test('effective feature codes are base plus organization overrides', function () {
    $plan = Plan::factory()->create();
    $organization = Organization::factory()->create();
    $other = Organization::factory()->create();

    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API']);
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'sso', 'name' => 'SSO']);
    $plan->features()->create([
        'project_id' => 'proj-1', 'code' => 'audit-log', 'name' => 'Audit',
        'organization_id' => $organization->id,
    ]);

    expect($plan->effectiveFeatureCodes($organization->id))->toBe(['api-access', 'sso', 'audit-log'])
        ->and($plan->effectiveFeatureCodes($other->id))->toBe(['api-access', 'sso'])
        ->and($plan->effectiveFeatureCodes())->toBe(['api-access', 'sso']);
});
