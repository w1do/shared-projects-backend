<?php

declare(strict_types=1);

use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;

/**
 * Характеризационные снимки контракта настроек провайдеров (Д3):
 * список без значений credentials, show — полные данные под manage,
 * ненастроенный провайдер — пустая заготовка, а не 404.
 */
const PAY_PROVIDER_SETTINGS_PERMS = ['pay.providers.view', 'pay.providers.manage'];

function payProviderSettingsAccount(): ProviderAccount
{
    app(ProjectContext::class)->set('proj-1');
    $account = ProviderAccount::create([
        'provider' => 'platega',
        'group' => 'payments',
        'label' => 'Платёжные системы',
        'name' => 'Platega',
        'credentials' => ['merchant_id' => 'merchant-1', 'secret' => 'secret-1'],
        'properties' => ['payment_method' => 2],
        'return_url' => 'https://shop.example/ok',
        'fail_url' => 'https://shop.example/fail',
        'status' => 'active',
    ]);
    app(ProjectContext::class)->clear();

    return $account;
}

test('contract: providers list shows metadata and has_credentials only', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDER_SETTINGS_PERMS);
    payProviderSettingsAccount();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/pay/providers', $headers);

    ResponseSnapshot::assertMatches($response, 'pay-providers-index');
});

test('contract: providers list without permission is 403', function () {
    $headers = actingAsPayOperator(permissions: ['pay.plans.view']);

    $response = $this->getJson('/api/admin/v1/projects/proj-1/pay/providers', $headers);

    ResponseSnapshot::assertMatches($response, 'pay-providers-index-403');
});

test('contract: provider show returns full settings under manage', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDER_SETTINGS_PERMS);
    payProviderSettingsAccount();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/pay/providers/platega', $headers);

    ResponseSnapshot::assertMatches($response, 'pay-providers-show');
});

test('contract: provider show under view-only permission is 403', function () {
    $headers = actingAsPayOperator(permissions: ['pay.providers.view']);

    $response = $this->getJson('/api/admin/v1/projects/proj-1/pay/providers/platega', $headers);

    ResponseSnapshot::assertMatches($response, 'pay-providers-show-403');
});

test('contract: unconfigured provider show is a blank prefab, not 404', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDER_SETTINGS_PERMS);

    $response = $this->getJson('/api/admin/v1/projects/proj-1/pay/providers/platega', $headers);

    ResponseSnapshot::assertMatches($response, 'pay-providers-show-blank');
});

test('contract: provider upsert persists and echoes the settings', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDER_SETTINGS_PERMS);

    $response = $this->putJson('/api/admin/v1/projects/proj-1/pay/providers/platega', [
        'credentials' => ['merchant_id' => 'merchant-1', 'secret' => 'secret-1'],
        'properties' => ['payment_method' => 2],
        'return_url' => 'https://shop.example/ok',
        'fail_url' => 'https://shop.example/fail',
        'status' => 'active',
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'pay-providers-update');
});

test('contract: provider upsert with invalid url is rejected', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDER_SETTINGS_PERMS);

    $response = $this->putJson('/api/admin/v1/projects/proj-1/pay/providers/platega', [
        'return_url' => 'not-a-url',
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'pay-providers-update-422');
});

test('contract: provider outside the registry is rejected', function () {
    $headers = actingAsPayOperator(permissions: PAY_PROVIDER_SETTINGS_PERMS);

    $response = $this->putJson('/api/admin/v1/projects/proj-1/pay/providers/stripe', [
        'credentials' => ['secret' => 'x'],
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'pay-providers-unknown-422');
});
