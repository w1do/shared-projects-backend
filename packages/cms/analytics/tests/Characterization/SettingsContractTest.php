<?php

declare(strict_types=1);

use Cms\Analytics\Domain\Settings\AnalyticsSettings;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\DB;

/**
 * Характеризационные снимки контракта настроек аналитики (admin GET/PUT)
 * и публичного конфига счётчиков (GET /api/v1/analytics/config).
 */
const ANALYTICS_SETTINGS_PERMS = ['analytics.settings.view', 'analytics.settings.manage'];

test('contract: analytics settings show defaults', function () {
    $headers = actingAsAnalyticsOperator(permissions: ANALYTICS_SETTINGS_PERMS);

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/settings', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-settings-show-defaults');
});

test('contract: analytics settings update persists values', function () {
    $headers = actingAsAnalyticsOperator(permissions: ANALYTICS_SETTINGS_PERMS);

    $updated = $this->putJson('/api/admin/v1/projects/proj-1/analytics/settings', [
        'yandex_enabled' => true,
        'yandex_id' => '12345678',
        'google_enabled' => false,
        'google_id' => null,
    ], $headers);

    ResponseSnapshot::assertMatches($updated, 'analytics-settings-update');

    // значения сохраняются per-project в таблице settings
    expect(DB::table('settings')->where('project_id', 'proj-1')->where('group', AnalyticsSettings::group())->count())->toBe(4);

    $shown = $this->getJson('/api/admin/v1/projects/proj-1/analytics/settings', $headers);

    ResponseSnapshot::assertMatches($shown, 'analytics-settings-show-updated');
});

test('contract: enabled provider requires its counter id', function () {
    $headers = actingAsAnalyticsOperator(permissions: ANALYTICS_SETTINGS_PERMS);

    $response = $this->putJson('/api/admin/v1/projects/proj-1/analytics/settings', [
        'yandex_enabled' => true,
        'yandex_id' => null,
        'google_enabled' => false,
        'google_id' => null,
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-settings-update-422');
});

test('contract: analytics settings update without permission is 403', function () {
    $headers = actingAsAnalyticsOperator(permissions: ['analytics.settings.view']);

    $response = $this->putJson('/api/admin/v1/projects/proj-1/analytics/settings', [
        'yandex_enabled' => false,
        'yandex_id' => null,
        'google_enabled' => false,
        'google_id' => null,
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-settings-update-403');
});

test('contract: public config hides ids of disabled providers', function () {
    $headers = siteCollectHeaders();

    $response = $this->getJson('/api/v1/analytics/config', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-config-public-disabled');
});

test('contract: public config exposes ids of enabled providers', function () {
    $operator = actingAsAnalyticsOperator(permissions: ANALYTICS_SETTINGS_PERMS);

    $this->putJson('/api/admin/v1/projects/proj-1/analytics/settings', [
        'yandex_enabled' => true,
        'yandex_id' => '12345678',
        'google_enabled' => true,
        'google_id' => 'G-ABCDEF1234',
    ], $operator)->assertOk();

    $response = $this->getJson('/api/v1/analytics/config', ['X-Api-Key' => 'pk_live_test']);

    ResponseSnapshot::assertMatches($response, 'analytics-config-public');
});
