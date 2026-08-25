<?php

declare(strict_types=1);

use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Redis;

/**
 * Характеризационные снимки service-to-service контракта
 * (routes/internal.php → POST /internal/events).
 *
 * Service-token сейчас сверяется hash_equals прямо в контроллере, а «валидация»
 * events — ручная ветка ErrorEnvelope::validation. Снимки фиксируют обе.
 * Все идентификаторы и метки времени в фикстурах — фиксированные литералы.
 */
beforeEach(function () {
    Redis::del('analytics:buffer', 'analytics:dead');
    config(['cms.service_token' => 'svc-1']);
});

/** @return array<int, array<string, mixed>> */
function internalEventFixture(string $name = 'user.registered'): array
{
    return [[
        'project_id' => 'proj-1',
        'name' => $name,
        'subject_key' => 'user:proj-1:5',
        'event_id' => '018f0000-0000-7000-8000-000000000001',
        'occurred_at' => '2026-08-01T10:00:00+00:00',
    ]];
}

test('contract: analytics internal events accepted', function () {
    $response = $this->postJson(
        '/internal/events',
        ['events' => internalEventFixture()],
        ['Authorization' => 'Service svc-1'],
    );

    ResponseSnapshot::assertMatches($response, 'analytics-internal-events-202');
});

test('contract: analytics internal events accepted for a batch', function () {
    $events = internalEventFixture();
    $events[] = [
        'project_id' => 'proj-1',
        'name' => 'payment.succeeded',
        'subject_key' => 'user:proj-1:5',
        'event_id' => '018f0000-0000-7000-8000-000000000002',
        'occurred_at' => '2026-08-01T10:05:00+00:00',
        'value_minor' => 4900,
        'currency' => 'RUB',
        'source' => 'pay',
    ];

    $response = $this->postJson('/internal/events', ['events' => $events], ['Authorization' => 'Service svc-1']);

    ResponseSnapshot::assertMatches($response, 'analytics-internal-events-202-batch');
});

test('contract: analytics internal events skips rows without project id', function () {
    // Событие без project_id молча пропускается: 202 с accepted = 0.
    $response = $this->postJson(
        '/internal/events',
        ['events' => [['name' => 'user.registered', 'subject_key' => 'user:proj-1:5']]],
        ['Authorization' => 'Service svc-1'],
    );

    ResponseSnapshot::assertMatches($response, 'analytics-internal-events-202-skipped');
});

test('contract: analytics internal events skips invalid event names', function () {
    $response = $this->postJson(
        '/internal/events',
        ['events' => internalEventFixture('User Registered')],
        ['Authorization' => 'Service svc-1'],
    );

    ResponseSnapshot::assertMatches($response, 'analytics-internal-events-202-invalid-name');
});

test('contract: analytics internal events unauthenticated without token', function () {
    $response = $this->postJson('/internal/events', ['events' => internalEventFixture()]);

    ResponseSnapshot::assertMatches($response, 'analytics-internal-events-401-no-token');
});

test('contract: analytics internal events unauthenticated with wrong token', function () {
    $response = $this->postJson(
        '/internal/events',
        ['events' => internalEventFixture()],
        ['Authorization' => 'Service wrong-token'],
    );

    ResponseSnapshot::assertMatches($response, 'analytics-internal-events-401-wrong-token');
});

test('contract: analytics internal events unauthenticated when token is not configured', function () {
    config(['cms.service_token' => '']);

    $response = $this->postJson(
        '/internal/events',
        ['events' => internalEventFixture()],
        ['Authorization' => 'Service '],
    );

    ResponseSnapshot::assertMatches($response, 'analytics-internal-events-401-unconfigured');
});

test('contract: analytics internal events validation error on missing events', function () {
    $response = $this->postJson('/internal/events', [], ['Authorization' => 'Service svc-1']);

    ResponseSnapshot::assertMatches($response, 'analytics-internal-events-422-missing');

    expect($response->json('error.details.events'))->toBe(['Provide at least one event.']);
});

test('contract: analytics internal events validation error on empty events', function () {
    $response = $this->postJson('/internal/events', ['events' => []], ['Authorization' => 'Service svc-1']);

    ResponseSnapshot::assertMatches($response, 'analytics-internal-events-422-empty');
});

test('contract: analytics internal events validation error on scalar events', function () {
    $response = $this->postJson(
        '/internal/events',
        ['events' => 'user.registered'],
        ['Authorization' => 'Service svc-1'],
    );

    ResponseSnapshot::assertMatches($response, 'analytics-internal-events-422-scalar');
});
