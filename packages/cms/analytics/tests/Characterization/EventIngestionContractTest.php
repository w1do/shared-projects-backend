<?php

declare(strict_types=1);

use Cms\Analytics\Infrastructure\Persistence\EventBuffer;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Redis;

/**
 * Задача 0.10 — характеризация контракта приёма событий (internal + site).
 *
 * Фиксируется не только форма ответа, но и содержимое буфера: поэлементная
 * отбраковка со счётчиком accepted, per-event project_id/source (И17 —
 * батч не схлопывается по тенанту) и тихое приведение currency: null → ''.
 *
 * Все фикстуры — фиксированные литералы, без faker.
 */
beforeEach(function () {
    Redis::del('analytics:buffer', 'analytics:dead');
    RateLimiter::clear('collect:proj-1');
    config(['cms.service_token' => 'svc-1']);
});

test('guard: 0.10 internal events batch accepts only the valid row', function () {
    // (a) валидное событие + невалидное имя + событие без project_id → accepted = 1.
    $response = $this->postJson('/internal/events', ['events' => [
        [
            'project_id' => 'proj-1',
            'name' => 'user.registered',
            'subject_key' => 'user:proj-1:5',
            'event_id' => '018f0000-0000-7000-8000-000000000011',
            'occurred_at' => '2026-08-01T10:00:00+00:00',
        ],
        [
            'project_id' => 'proj-1',
            'name' => 'Bad Name!',
            'subject_key' => 'user:proj-1:6',
            'event_id' => '018f0000-0000-7000-8000-000000000012',
            'occurred_at' => '2026-08-01T10:01:00+00:00',
        ],
        [
            'name' => 'user.logged_in',
            'subject_key' => 'user:proj-1:7',
            'event_id' => '018f0000-0000-7000-8000-000000000013',
            'occurred_at' => '2026-08-01T10:02:00+00:00',
        ],
    ]], ['Authorization' => 'Service svc-1']);

    ResponseSnapshot::assertMatches($response, 'analytics-internal-events-202-mixed-batch');

    expect($response->json('data.accepted'))->toBe(1);

    $buffer = app(EventBuffer::class);
    expect($buffer->size())->toBe(1);

    $stored = $buffer->peek(10);
    expect($stored)->toHaveCount(1)
        ->and($stored[0]['project_id'])->toBe('proj-1')
        ->and($stored[0]['name'])->toBe('user.registered')
        ->and($stored[0]['subject_key'])->toBe('user:proj-1:5')
        ->and($stored[0]['source'])->toBe('service');
});

test('guard: 0.10 internal events keep per event project id and source', function () {
    // (b) И17: батч из двух тенантов не схлопывается — каждый пишется со СВОИМИ project_id/source.
    $response = $this->postJson('/internal/events', ['events' => [
        [
            'project_id' => 'proj-1',
            'source' => 'auth',
            'name' => 'user.registered',
            'subject_key' => 'user:proj-1:5',
            'event_id' => '018f0000-0000-7000-8000-000000000021',
            'occurred_at' => '2026-08-01T10:00:00+00:00',
        ],
        [
            'project_id' => 'proj-2',
            'source' => 'pay',
            'name' => 'payment.succeeded',
            'subject_key' => 'user:proj-2:9',
            'event_id' => '018f0000-0000-7000-8000-000000000022',
            'occurred_at' => '2026-08-01T10:05:00+00:00',
        ],
    ]], ['Authorization' => 'Service svc-1']);

    ResponseSnapshot::assertMatches($response, 'analytics-internal-events-202-two-tenants');

    expect($response->json('data.accepted'))->toBe(2);

    $stored = app(EventBuffer::class)->peek(10);
    expect($stored)->toHaveCount(2)
        ->and($stored[0]['project_id'])->toBe('proj-1')
        ->and($stored[0]['source'])->toBe('auth')
        ->and($stored[0]['name'])->toBe('user.registered')
        ->and($stored[0]['subject_key'])->toBe('user:proj-1:5')
        ->and($stored[1]['project_id'])->toBe('proj-2')
        ->and($stored[1]['source'])->toBe('pay')
        ->and($stored[1]['name'])->toBe('payment.succeeded')
        ->and($stored[1]['subject_key'])->toBe('user:proj-2:9');

    // Ни одна пара (project_id, source) не приписана чужому событию.
    expect(array_column($stored, 'project_id'))->toBe(['proj-1', 'proj-2'])
        ->and(array_column($stored, 'source'))->toBe(['auth', 'pay']);
});

test('guard: 0.10 internal events coerce null currency to empty string', function () {
    // (c) currency: null гасится в '' (RecordEventsHandler:48), а не даёт 422.
    $response = $this->postJson('/internal/events', ['events' => [[
        'project_id' => 'proj-1',
        'name' => 'payment.succeeded',
        'subject_key' => 'user:proj-1:5',
        'event_id' => '018f0000-0000-7000-8000-000000000031',
        'occurred_at' => '2026-08-01T10:00:00+00:00',
        'value_minor' => 4900,
        'currency' => null,
    ]]], ['Authorization' => 'Service svc-1']);

    ResponseSnapshot::assertMatches($response, 'analytics-internal-events-202-null-currency');

    expect($response->json('data.accepted'))->toBe(1);

    $stored = app(EventBuffer::class)->peek(10);
    expect($stored)->toHaveCount(1)
        ->and($stored[0]['currency'])->toBe('')
        ->and($stored[0]['value_minor'])->toBe(4900);
});

test('guard: 0.10 collect batch with an empty event name stores only the valid event', function () {
    // (d) пустое имя молча отбрасывается: 202 и ровно одна запись в буфере.
    $headers = siteCollectHeaders();

    $response = $this->postJson('/api/v1/collect', ['events' => [
        ['name' => 'my.custom_event'],
        ['name' => ''],
    ]], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-202-empty-name');

    $buffer = app(EventBuffer::class);
    expect($buffer->size())->toBe(1);

    $stored = $buffer->peek(10);
    expect($stored)->toHaveCount(1)
        ->and($stored[0]['name'])->toBe('my.custom_event')
        ->and($stored[0]['project_id'])->toBe('proj-1')
        ->and($stored[0]['source'])->toBe('site');
});
