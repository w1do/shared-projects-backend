<?php

declare(strict_types=1);

use Cms\Pay\Domain\Enums\ProviderStatus;
use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Shared\Tenant\ProjectContext;

const PAY_PROVIDERS_PERMS = ['pay.providers.view', 'pay.providers.manage'];

function payProvidersUrl(string $suffix = ''): string
{
    return '/api/admin/v1/projects/proj-1/pay/providers'.$suffix;
}

test('provider settings list hides credential values but flags their presence', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDERS_PERMS);

    app(ProjectContext::class)->set('proj-1');
    ProviderAccount::create([
        'provider' => 'platega',
        'group' => 'payments',
        'label' => 'Платёжные системы',
        'name' => 'Platega',
        'credentials' => ['merchant_id' => 'm-1', 'secret' => 'super-secret'],
        'return_url' => 'https://shop.example/ok',
    ]);
    app(ProjectContext::class)->clear();

    $response = $this->getJson(payProvidersUrl(), $headers);

    $response->assertOk();

    $row = collect($response->json('data'))->firstWhere('provider', 'platega');

    expect($row)->not->toBeNull()
        ->and($row['has_credentials'])->toBeTrue()
        ->and($row)->not->toHaveKey('credentials')
        ->and($response->getContent())->not->toContain('super-secret');
});

test('provider settings list enumerates registry providers with blank rows', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDERS_PERMS);

    $response = $this->getJson(payProvidersUrl(), $headers);

    $response->assertOk();

    $providers = collect($response->json('data'))->pluck('provider');

    expect($providers)->toContain('platega')
        ->and(collect($response->json('data'))->firstWhere('provider', 'platega')['has_credentials'])->toBeFalse();
});

test('provider settings list requires view permission', function () {
    $headers = actingAsPayOperator(permissions: ['pay.plans.view']);

    $this->getJson(payProvidersUrl(), $headers)->assertForbidden();
});

test('provider settings show returns full settings under manage permission', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDERS_PERMS);

    app(ProjectContext::class)->set('proj-1');
    ProviderAccount::create([
        'provider' => 'platega',
        'credentials' => ['merchant_id' => 'm-1', 'secret' => 's-1'],
        'properties' => ['note' => 'x'],
        'return_url' => 'https://shop.example/ok',
        'fail_url' => 'https://shop.example/fail',
        'status' => 'archived',
    ]);
    app(ProjectContext::class)->clear();

    $this->getJson(payProvidersUrl('/platega'), $headers)
        ->assertOk()
        ->assertJsonPath('data.credentials.merchant_id', 'm-1')
        ->assertJsonPath('data.credentials.secret', 's-1')
        ->assertJsonPath('data.properties.note', 'x')
        ->assertJsonPath('data.return_url', 'https://shop.example/ok')
        ->assertJsonPath('data.fail_url', 'https://shop.example/fail')
        ->assertJsonPath('data.status', 'archived');
});

test('provider settings show requires manage permission, view is not enough', function () {
    $headers = actingAsPayOperator(permissions: ['pay.providers.view']);

    $this->getJson(payProvidersUrl('/platega'), $headers)->assertForbidden();
});

test('provider settings show returns blank prefab for unconfigured provider', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDERS_PERMS);

    $this->getJson(payProvidersUrl('/platega'), $headers)
        ->assertOk()
        ->assertJsonPath('data.provider', 'platega')
        ->assertJsonPath('data.group', 'payments')
        ->assertJsonPath('data.label', 'Платёжные системы')
        ->assertJsonPath('data.name', 'Platega')
        ->assertJsonPath('data.status', 'active')
        ->assertJsonPath('data.credentials', [])
        ->assertJsonPath('data.properties', [])
        ->assertJsonPath('data.return_url', null)
        ->assertJsonPath('data.fail_url', null);
});

test('provider settings upsert saves and reads back the same values', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDERS_PERMS);

    $payload = [
        'credentials' => ['merchant_id' => 'm-1', 'secret' => 's-1'],
        'properties' => ['payment_method' => 2],
        'return_url' => 'https://shop.example/ok',
        'fail_url' => 'https://shop.example/fail',
        'status' => 'active',
    ];

    $this->putJson(payProvidersUrl('/platega'), $payload, $headers)
        ->assertOk()
        ->assertJsonPath('data.provider', 'platega')
        ->assertJsonPath('data.group', 'payments')
        ->assertJsonPath('data.name', 'Platega')
        ->assertJsonPath('data.status', 'active');

    $this->getJson(payProvidersUrl('/platega'), $headers)
        ->assertOk()
        ->assertJsonPath('data.credentials.merchant_id', 'm-1')
        ->assertJsonPath('data.credentials.secret', 's-1')
        ->assertJsonPath('data.properties.payment_method', 2)
        ->assertJsonPath('data.return_url', 'https://shop.example/ok')
        ->assertJsonPath('data.fail_url', 'https://shop.example/fail');
});

test('provider settings upsert updates the existing row without duplicates', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDERS_PERMS);

    $this->putJson(payProvidersUrl('/platega'), ['credentials' => ['secret' => 'a']], $headers)->assertOk();
    $this->putJson(payProvidersUrl('/platega'), ['credentials' => ['secret' => 'b']], $headers)->assertOk();

    $rows = ProviderAccount::acrossProjects()
        ->where('project_id', 'proj-1')->where('provider', 'platega')->get();

    expect($rows)->toHaveCount(1)
        ->and($rows->first()->credentials)->toBe(['secret' => 'b']);
});

test('provider settings upsert keeps untouched fields intact', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDERS_PERMS);

    $this->putJson(payProvidersUrl('/platega'), [
        'credentials' => ['secret' => 'a'],
        'return_url' => 'https://shop.example/ok',
    ], $headers)->assertOk();

    // Поле не передано — «не трогать», а не «обнулить» (И1)
    $this->putJson(payProvidersUrl('/platega'), ['status' => 'archived'], $headers)->assertOk();

    $account = ProviderAccount::acrossProjects()
        ->where('project_id', 'proj-1')->where('provider', 'platega')->firstOrFail();

    expect($account->credentials)->toBe(['secret' => 'a'])
        ->and($account->return_url)->toBe('https://shop.example/ok')
        ->and($account->status)->toBe(ProviderStatus::Archived);
});

test('provider settings upsert rejects invalid url and unknown status without saving', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDERS_PERMS);

    $this->putJson(payProvidersUrl('/platega'), ['return_url' => 'not-a-url'], $headers)
        ->assertUnprocessable()
        ->assertJsonPath('error.code', 'validation_failed');

    $this->putJson(payProvidersUrl('/platega'), ['status' => 'disabled'], $headers)
        ->assertUnprocessable();

    // Список: ключ → значение, не JSON-массив
    $this->putJson(payProvidersUrl('/platega'), ['credentials' => ['a', 'b']], $headers)
        ->assertUnprocessable();

    expect(ProviderAccount::acrossProjects()->where('project_id', 'proj-1')->count())->toBe(0);
});

test('provider settings upsert rejects provider missing from the registry', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDERS_PERMS);

    $this->putJson(payProvidersUrl('/stripe'), ['credentials' => ['secret' => 'x']], $headers)
        ->assertUnprocessable();

    $this->getJson(payProvidersUrl('/stripe'), $headers)->assertUnprocessable();
});

test('payments settings accept a registry provider and reject an unknown one', function () {
    $headers = actingAsPayOperator(permissions: ['pay.settings.view', 'pay.settings.manage']);

    $this->putJson('/api/admin/v1/projects/proj-1/pay/settings', ['provider' => 'platega'], $headers)
        ->assertOk()
        ->assertJsonPath('data.provider', 'platega');

    $this->putJson('/api/admin/v1/projects/proj-1/pay/settings', ['provider' => 'stripe'], $headers)
        ->assertUnprocessable();
});

test('provider settings are isolated per project', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDERS_PERMS);

    app(ProjectContext::class)->set('proj-2');
    ProviderAccount::create(['provider' => 'platega', 'credentials' => ['secret' => 'other-project']]);
    app(ProjectContext::class)->clear();

    $this->getJson(payProvidersUrl('/platega'), $headers)
        ->assertOk()
        ->assertJsonPath('data.credentials', []);
});
