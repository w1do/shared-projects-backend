<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Licensing\Domain\Models\PlanFeature;
use Cms\Shared\Tenant\ProjectContext;

test('plan code must be unique within the project', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    Plan::factory()->create(['code' => 'enterprise']);

    $response = $this->postJson(licensingUrl('plans'), [
        'code' => 'enterprise', 'name' => 'Enterprise',
    ], $headers)->assertStatus(422);

    expect($response->json('error.details.code.0'))->toBe('Plan code is already taken.');
});

test('same plan code in different projects is allowed', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-2');
    Plan::factory()->create(['project_id' => 'proj-2', 'code' => 'enterprise']);
    app(ProjectContext::class)->set('proj-1');

    $this->postJson(licensingUrl('plans'), [
        'code' => 'enterprise', 'name' => 'Enterprise',
    ], $headers)->assertCreated();
});

test('partially filled price triple is rejected', function (array $price) {
    $headers = licensingOperator();

    $this->postJson(licensingUrl('plans'), array_merge([
        'code' => 'enterprise', 'name' => 'Enterprise',
    ], $price), $headers)->assertStatus(422);
})->with([
    'only price' => [['price_minor' => 49900]],
    'price and currency' => [['price_minor' => 49900, 'currency' => 'RUB']],
    'only interval' => [['interval' => 'month']],
]);

test('full price triple is stored and cleared atomically', function () {
    $headers = licensingOperator();

    $id = $this->postJson(licensingUrl('plans'), [
        'code' => 'enterprise', 'name' => 'Enterprise',
        'price_minor' => 49900, 'currency' => 'rub', 'interval' => 'month',
    ], $headers)->assertCreated()->json('data.id');

    app(ProjectContext::class)->set('proj-1');
    $plan = Plan::query()->findOrFail($id);
    expect($plan->hasPrice())->toBeTrue()
        ->and($plan->currency)->toBe('RUB'); // нормализация к верхнему регистру

    // Явный сброс цены: тройка очищается целиком
    $this->putJson(licensingUrl("plans/{$id}"), [
        'code' => 'enterprise', 'name' => 'Enterprise',
        'price_minor' => null, 'currency' => null, 'interval' => null,
    ], $headers)->assertOk();

    $fresh = $plan->fresh();
    expect($fresh->hasPrice())->toBeFalse()
        ->and($fresh->price_minor)->toBeNull()
        ->and($fresh->currency)->toBeNull()
        ->and($fresh->interval)->toBeNull();
});

test('plan show returns base features and per-organization overrides', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $plan = Plan::factory()->create();
    $organization = Organization::factory()->create();
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API']);
    $plan->features()->create([
        'project_id' => 'proj-1', 'code' => 'audit-log', 'name' => 'Audit',
        'organization_id' => $organization->id,
    ]);

    $response = $this->getJson(licensingUrl("plans/{$plan->id}"), $headers)->assertOk();

    expect(collect($response->json('data.features'))->pluck('code'))->toContain('api-access')->not->toContain('audit-log')
        ->and($response->json('data.overrides.0.code'))->toBe('audit-log')
        ->and($response->json('data.overrides.0.organization_id'))->toBe($organization->id);
});

test('duplicate base feature code is rejected', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $plan = Plan::factory()->create();
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API']);

    $response = $this->postJson(licensingUrl("plans/{$plan->id}/features"), [
        'code' => 'api-access', 'name' => 'API again',
    ], $headers)->assertStatus(422);

    expect($response->json('error.details.code.0'))->toBe('Feature code is already present for this plan.');
});

test('same feature code is allowed as an organization override', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $plan = Plan::factory()->create();
    $organization = Organization::factory()->create();
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'seats', 'name' => 'Seats 5']);

    $this->postJson(licensingUrl("plans/{$plan->id}/features"), [
        'code' => 'seats', 'name' => 'Seats 50', 'organization_id' => $organization->id,
    ], $headers)->assertCreated();

    expect($plan->features()->count())->toBe(2);
});

test('feature override for a foreign organization is rejected', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-2');
    $foreign = Organization::factory()->create(['project_id' => 'proj-2']);
    app(ProjectContext::class)->set('proj-1');
    $plan = Plan::factory()->create();

    $response = $this->postJson(licensingUrl("plans/{$plan->id}/features"), [
        'code' => 'extra', 'name' => 'Extra', 'organization_id' => $foreign->id,
    ], $headers)->assertStatus(422);

    expect($response->json('error.details.organization_id.0'))->toBe('Unknown organization.');
});

test('plan with licenses cannot be deleted', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->create();

    $response = $this->deleteJson(licensingUrl("plans/{$license->plan_id}"), [], $headers)->assertStatus(422);

    expect($response->json('error.details.plan.0'))->toBe('Plan has licenses and cannot be deleted.')
        ->and(Plan::query()->whereKey($license->plan_id)->exists())->toBeTrue();
});

test('unused plan is deleted together with its features', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $plan = Plan::factory()->create();
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API']);

    $this->deleteJson(licensingUrl("plans/{$plan->id}"), [], $headers)->assertNoContent();

    expect(Plan::query()->whereKey($plan->id)->exists())->toBeFalse()
        ->and(PlanFeature::query()->count())->toBe(0);
});

test('feature management without manage permission is forbidden', function () {
    app(ProjectContext::class)->set('proj-1');
    $plan = Plan::factory()->create();
    $headers = licensingOperator(permissions: ['pay.licensing.view']);

    $this->postJson(licensingUrl("plans/{$plan->id}/features"), [
        'code' => 'extra', 'name' => 'Extra',
    ], $headers)->assertForbidden();
});
