<?php

declare(strict_types=1);

use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Cache;

/**
 * Характеризационные снимки единственного маршрута пакета shared:
 * POST /internal/cache-bust (packages/cms/shared/routes/internal.php).
 *
 * Фиксируют текущий контракт до рефакторинга: успешный ручной ответ
 * {"flushed": true} и конверт ошибки при неверном/отсутствующем service-token.
 * Базы данных маршрут не требует — кэш в тестах на array-драйвере.
 */
beforeEach(function () {
    config()->set('cms.service_token', 'contract-service-token');
});

test('contract: shared cache-bust success', function () {
    Cache::put('introspect:stale', 'value', 600);

    $response = $this->postJson('/internal/cache-bust', [], [
        'Authorization' => 'Service contract-service-token',
    ]);

    // Побочный эффект маршрута — сброс кэша; рефакторинг обязан его сохранить.
    expect(Cache::get('introspect:stale'))->toBeNull();

    ResponseSnapshot::assertMatches($response, 'cache-bust-success');
});

test('contract: shared cache-bust without authorization header', function () {
    Cache::put('introspect:stale', 'value', 600);

    $response = $this->postJson('/internal/cache-bust');

    expect(Cache::get('introspect:stale'))->toBe('value');

    ResponseSnapshot::assertMatches($response, 'cache-bust-401-missing-token');
});

test('contract: shared cache-bust with wrong token', function () {
    $response = $this->postJson('/internal/cache-bust', [], [
        'Authorization' => 'Service wrong-token',
    ]);

    ResponseSnapshot::assertMatches($response, 'cache-bust-401-wrong-token');
});

test('contract: shared cache-bust rejects bearer scheme', function () {
    $response = $this->postJson('/internal/cache-bust', [], [
        'Authorization' => 'Bearer contract-service-token',
    ]);

    ResponseSnapshot::assertMatches($response, 'cache-bust-401-bearer-scheme');
});

test('contract: shared cache-bust when service token is not configured', function () {
    config()->set('cms.service_token', '');

    $response = $this->postJson('/internal/cache-bust', [], [
        'Authorization' => 'Service ',
    ]);

    ResponseSnapshot::assertMatches($response, 'cache-bust-401-token-not-configured');
});
