<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan as LicensePlan;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Tenant\ProjectContext;

/** Подписка на предмет заданного типа: планы pay и планы лицензий живут рядом. */
function subscriptionOn(string $subjectType, string $subjectId): Subscription
{
    return Subscription::create([
        'subscriber_type' => 'site_user',
        'subscriber_id' => '7',
        'subject_type' => $subjectType,
        'subject_id' => $subjectId,
        'status' => 'active',
        'current_period_ends_at' => now()->addMonth(),
    ]);
}

test('subscriptions are filtered by the subject type', function () {
    $headers = actingAsPayOperator();
    app(ProjectContext::class)->set('proj-1');

    $plan = makePlan(['code' => 'pro', 'price_minor' => 1000]);
    $organization = Organization::factory()->create();
    $licensePlan = LicensePlan::factory()->create(['code' => 'enterprise']);

    subscriptionOn('plan', (string) $plan->id);
    subscriptionOn('license_plan', (string) $licensePlan->id);

    $all = $this->getJson('/api/admin/v1/projects/proj-1/pay/subscriptions', $headers)->assertOk()->json('data');
    $licenses = $this->getJson('/api/admin/v1/projects/proj-1/pay/subscriptions?subject_type=license_plan', $headers)
        ->assertOk()->json('data');

    expect($all)->toHaveCount(2)
        ->and($licenses)->toHaveCount(1)
        ->and($licenses[0]['subject']['type'])->toBe('license_plan')
        ->and($licenses[0]['subject']['code'])->toBe('enterprise')
        ->and($organization->exists)->toBeTrue();
});

test('payments are filtered by status', function () {
    $headers = actingAsPayOperator();
    app(ProjectContext::class)->set('proj-1');

    Payment::create(['subject_key' => 'user:proj-1:7', 'amount_minor' => 1000, 'currency' => 'RUB', 'provider' => 'manual', 'status' => 'succeeded']);
    Payment::create(['subject_key' => 'user:proj-1:8', 'amount_minor' => 2000, 'currency' => 'RUB', 'provider' => 'manual', 'status' => 'pending']);

    $succeeded = $this->getJson('/api/admin/v1/projects/proj-1/pay/payments?status=succeeded', $headers)
        ->assertOk()->json('data');

    expect($succeeded)->toHaveCount(1)
        ->and($succeeded[0]['status'])->toBe('succeeded')
        ->and($succeeded[0]['amount_minor'])->toBe(1000);
});

test('an unknown payment status is rejected', function () {
    $headers = actingAsPayOperator();

    $this->getJson('/api/admin/v1/projects/proj-1/pay/payments?status=whatever', $headers)->assertStatus(422);
});
