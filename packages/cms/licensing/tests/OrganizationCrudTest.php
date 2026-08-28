<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Shared\Tenant\ProjectContext;

test('organization is created with the full profile', function () {
    $headers = licensingOperator();

    $response = $this->postJson(licensingUrl('organizations'), [
        'name' => 'Acme LLC',
        'contact_first_name' => 'Ivan',
        'contact_last_name' => 'Petrov',
        'phone' => '+7 900 000-00-00',
        'email' => 'ivan@acme.example',
        'telegram' => '@acme',
        'activity' => 'E-commerce',
        'employees_count' => 42,
        'usage_purpose' => 'Self-hosted shop',
    ], $headers)->assertCreated();

    expect($response->json('data.name'))->toBe('Acme LLC')
        ->and($response->json('data.employees_count'))->toBe(42)
        ->and($response->json('data.telegram'))->toBe('@acme');

    app(ProjectContext::class)->set('proj-1');
    expect(Organization::query()->sole()->email)->toBe('ivan@acme.example');
});

test('organization without required fields is rejected', function () {
    $headers = licensingOperator();

    $response = $this->postJson(licensingUrl('organizations'), [
        'contact_first_name' => 'Ivan',
        'contact_last_name' => 'Petrov',
    ], $headers)->assertStatus(422);

    expect($response->json('error.details'))->toHaveKeys(['name', 'email']);
});

test('partial update touches only the provided profile fields', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create([
        'name' => 'Acme LLC', 'phone' => '+7 900 000-00-00', 'employees_count' => 10,
    ]);

    $this->putJson(licensingUrl("organizations/{$organization->id}"), [
        'name' => 'Acme LLC',
        'contact_first_name' => $organization->contact_first_name,
        'contact_last_name' => $organization->contact_last_name,
        'email' => $organization->email,
        'employees_count' => 42,
    ], $headers)->assertOk();

    $fresh = $organization->fresh();
    expect($fresh->employees_count)->toBe(42)
        ->and($fresh->phone)->toBe('+7 900 000-00-00'); // непереданное поле не тронуто
});

test('organizations list is a cursor page scoped to the project', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    Organization::factory()->count(3)->create();

    app(ProjectContext::class)->set('proj-2');
    Organization::factory()->create(['project_id' => 'proj-2', 'name' => 'Foreign Org']);
    app(ProjectContext::class)->set('proj-1');

    $response = $this->getJson(licensingUrl('organizations'), $headers)->assertOk();

    expect(array_keys($response->json()))->toBe(['data', 'meta'])
        ->and(array_keys($response->json('meta')))->toBe(['per_page', 'next_cursor', 'prev_cursor'])
        ->and($response->json('data'))->toHaveCount(3)
        ->and(collect($response->json('data'))->pluck('name'))->not->toContain('Foreign Org');
});

test('foreign organization is 404 by direct id', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-2');
    $foreign = Organization::factory()->create(['project_id' => 'proj-2']);
    app(ProjectContext::class)->set('proj-1');

    $this->getJson(licensingUrl("organizations/{$foreign->id}"), $headers)->assertNotFound();
});

test('operator without licensing view permission gets 403', function () {
    $headers = licensingOperator(permissions: ['pay.plans.view']);

    $this->getJson(licensingUrl('organizations'), $headers)->assertForbidden();
});

test('organization with a license cannot be deleted', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->create();

    $response = $this->deleteJson(licensingUrl("organizations/{$license->organization_id}"), [], $headers)
        ->assertStatus(422);

    expect($response->json('error.details.organization.0'))->toBe('Organization has licenses and cannot be deleted.')
        ->and(Organization::query()->whereKey($license->organization_id)->exists())->toBeTrue();
});

test('organization without licenses is deleted together with its overrides', function () {
    $headers = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create();
    $plan = Plan::factory()->create();
    $plan->features()->create([
        'project_id' => 'proj-1', 'organization_id' => $organization->id,
        'code' => 'extra', 'name' => 'Extra',
    ]);

    $this->deleteJson(licensingUrl("organizations/{$organization->id}"), [], $headers)->assertNoContent();

    expect(Organization::query()->whereKey($organization->id)->exists())->toBeFalse()
        ->and($plan->features()->count())->toBe(0);
});
