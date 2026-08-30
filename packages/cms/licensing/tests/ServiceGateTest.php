<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use Cms\Shared\Tenant\ProjectContext;

// Гейт admin-маршрутов — сервис pay: отдельного переключателя у лицензирования нет.

test('admin routes return 404 while pay is disabled and data survives re-enable', function () {
    $enabled = licensingOperator();
    $this->postJson(licensingUrl('organizations'), [
        'name' => 'Acme', 'contact_first_name' => 'I', 'contact_last_name' => 'P', 'email' => 'a@b.c',
    ], $enabled)->assertCreated();

    $disabled = actingAsPayOperator(
        permissions: ['pay.licensing.view', 'pay.licensing.manage'],
        services: ['content'],
    );
    $this->getJson(licensingUrl('organizations'), $disabled)->assertNotFound();

    $reEnabled = licensingOperator();
    $this->getJson(licensingUrl('organizations'), $reEnabled)
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Acme');
});

test('enabling pay opens both licensing and payment routes', function () {
    $headers = actingAsPayOperator(
        permissions: ['pay.licensing.view', 'pay.plans.view'],
        services: ['pay'],
    );

    $this->getJson(licensingUrl('organizations'), $headers)->assertOk();
    $this->getJson('/api/admin/v1/projects/proj-1/pay/plans', $headers)->assertOk();
});

test('public activation responds normally while pay is disabled', function () {
    // Лицензия выпущена штатно при включённом сервисе.
    $enabled = licensingOperator();
    app(ProjectContext::class)->set('proj-1');
    $organization = Organization::factory()->create();
    $plan = Plan::factory()->create(['code' => 'enterprise']);
    $plan->features()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API']);
    $key = $this->postJson(licensingUrl('licenses'), [
        'organization_id' => $organization->id,
        'plan_id' => $plan->id,
        'updates_until' => now()->addYear()->toDateString(),
    ], $enabled)->assertCreated()->json('data.key');
    app(ProjectContext::class)->clear();

    // Introspector отдаёт проект без pay — публичная активация сервисом не гейтится.
    actingAsPayOperator(services: ['content']);

    $response = $this->postJson('/api/v1/pay/licensing/license/activate', [
        'key' => $key,
        'install_id' => str_repeat('ab', 32),
        'domain' => 'crm.client.example',
        'app_version' => '1.0.0',
    ])->assertOk();

    expect($response->json('data.state'))->toBe('licensed');
    $payload = licensingVerifyToken((string) $response->json('data.token'));
    expect($payload['edition'])->toBe('enterprise')
        ->and($payload['features'])->toBe(['api-access']);
});
