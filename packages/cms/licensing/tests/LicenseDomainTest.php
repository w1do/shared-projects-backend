<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Enums\LicenseStatus;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
});

test('license status derives from facts and revoked_at wins', function () {
    $active = License::factory()->create();
    $expired = License::factory()->expired()->create();
    $revoked = License::factory()->revoked()->create();
    $revokedAndExpired = License::factory()->expired()->revoked()->create();

    expect($active->status())->toBe(LicenseStatus::Active)
        ->and($expired->status())->toBe(LicenseStatus::Expired)
        ->and($revoked->status())->toBe(LicenseStatus::Revoked)
        ->and($revokedAndExpired->status())->toBe(LicenseStatus::Revoked);
});

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

test('partially priced plan does not count as priced', function () {
    $plan = Plan::factory()->create(['price_minor' => 1000]); // без currency/interval

    expect($plan->hasPrice())->toBeFalse();
    $plan->subscriptionInterval();
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
