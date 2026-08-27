<?php

declare(strict_types=1);

use Cms\Pay\Domain\Settings\PaymentsSettings;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;

/**
 * Характеризационные снимки контракта настроек платежей: выбор провайдера
 * (platega по умолчанию), полей доставки/налогов в контракте нет.
 */
const PAY_SETTINGS_PERMS = ['pay.settings.view', 'pay.settings.manage'];

test('contract: payments settings show defaults to platega', function () {
    $headers = actingAsPayOperator(permissions: PAY_SETTINGS_PERMS);

    $response = $this->getJson('/api/admin/v1/projects/proj-1/pay/settings', $headers);

    ResponseSnapshot::assertMatches($response, 'pay-settings-show-defaults');
});

test('contract: payments settings update persists the provider', function () {
    $headers = actingAsPayOperator(permissions: PAY_SETTINGS_PERMS);

    $updated = $this->putJson('/api/admin/v1/projects/proj-1/pay/settings', [
        'provider' => 'manual',
    ], $headers);

    ResponseSnapshot::assertMatches($updated, 'pay-settings-update');

    $shown = $this->getJson('/api/admin/v1/projects/proj-1/pay/settings', $headers);

    ResponseSnapshot::assertMatches($shown, 'pay-settings-show-updated');
});

test('contract: unknown provider is rejected', function () {
    $headers = actingAsPayOperator(permissions: PAY_SETTINGS_PERMS);

    $response = $this->putJson('/api/admin/v1/projects/proj-1/pay/settings', [
        'provider' => 'stripe',
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'pay-settings-update-422');
});

test('contract: payments settings update without permission is 403', function () {
    $headers = actingAsPayOperator(permissions: ['pay.settings.view']);

    $response = $this->putJson('/api/admin/v1/projects/proj-1/pay/settings', [
        'provider' => 'platega',
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'pay-settings-update-403');
});

test('pay service reads the selected provider from settings', function () {
    $headers = actingAsPayOperator(permissions: PAY_SETTINGS_PERMS);

    $this->putJson('/api/admin/v1/projects/proj-1/pay/settings', ['provider' => 'platega'], $headers)->assertOk();

    // Сервис читает выбранного провайдера через настройки в контексте проекта.
    app(ProjectContext::class)->set('proj-1');
    expect(app(PaymentsSettings::class)->provider)->toBe('platega');
});
