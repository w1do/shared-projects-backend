<?php

declare(strict_types=1);

use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Shared\AuthClient\CachedIntrospector;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Redis;

/**
 * Характеризационные снимки публичного контракта приёма событий
 * (routes/public.php → POST /api/v1/collect).
 *
 * Все фикстуры фиксированные: имена событий, пути, идентификаторы сессий.
 * Ответ не зависит от содержимого буфера, но буфер чистится, чтобы прогоны
 * не влияли друг на друга.
 */
beforeEach(function () {
    Redis::del('analytics:buffer', 'analytics:dead');
    RateLimiter::clear('collect:proj-1');
});

test('contract: analytics collect accepted', function () {
    $headers = siteCollectHeaders();

    $response = $this->postJson('/api/v1/collect', ['events' => [
        ['name' => 'page_view', 'path' => '/pricing', 'session_id' => 's1', 'anon_id' => 'a1'],
        ['name' => 'purchase', 'path' => '/checkout', 'session_id' => 's1', 'anon_id' => 'a1', 'value_minor' => 4900, 'currency' => 'RUB'],
    ]], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-202');
});

test('contract: analytics collect accepted for bot without storing', function () {
    // Ботам отвечаем тем же 202, но события не пишем — контракт ответа одинаков.
    $headers = siteCollectHeaders();
    $headers['User-Agent'] = 'Googlebot/2.1 (+http://www.google.com/bot.html)';

    $response = $this->postJson('/api/v1/collect', ['events' => [['name' => 'page_view']]], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-202-bot');
});

test('contract: analytics collect accepted when event names are dropped', function () {
    // Имя, не прошедшее нормализацию, молча отбрасывается; ответ остаётся 202.
    $headers = siteCollectHeaders();

    $response = $this->postJson('/api/v1/collect', ['events' => [
        ['name' => 'Page View'],
    ]], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-202-dropped-event');
});

test('contract: analytics collect validation error on empty events', function () {
    $headers = siteCollectHeaders();

    $response = $this->postJson('/api/v1/collect', ['events' => []], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-422-empty');

    expect($response->json('error.details.events'))->toBe(['Provide 1..100 events.']);
});

test('contract: analytics collect validation error on missing events', function () {
    $headers = siteCollectHeaders();

    $response = $this->postJson('/api/v1/collect', [], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-422-missing');
});

test('contract: analytics collect validation error on scalar events', function () {
    $headers = siteCollectHeaders();

    $response = $this->postJson('/api/v1/collect', ['events' => 'page_view'], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-422-scalar');
});

test('contract: analytics collect validation error above one hundred events', function () {
    $headers = siteCollectHeaders();

    $events = [];
    foreach (range(1, 101) as $i) {
        $events[] = ['name' => 'page_view', 'session_id' => 's'.$i];
    }

    $response = $this->postJson('/api/v1/collect', ['events' => $events], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-422-overflow');
});

test('contract: analytics collect accepts exactly one hundred events', function () {
    $headers = siteCollectHeaders();

    $events = [];
    foreach (range(1, 100) as $i) {
        $events[] = ['name' => 'page_view', 'session_id' => 's'.$i];
    }

    $response = $this->postJson('/api/v1/collect', ['events' => $events], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-202-boundary');
});

test('contract: analytics collect unauthenticated without key', function () {
    siteCollectHeaders();

    $response = $this->postJson('/api/v1/collect', ['events' => [['name' => 'page_view']]]);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-401-missing-key');
});

test('contract: analytics collect unauthenticated with invalid key', function () {
    $invalid = IntrospectionResult::invalid();
    app()->instance(CachedIntrospector::class, new FakeAnalyticsIntrospector($invalid, $invalid));

    $response = $this->postJson(
        '/api/v1/collect',
        ['events' => [['name' => 'page_view']]],
        ['X-Api-Key' => 'pk_live_bad'],
    );

    ResponseSnapshot::assertMatches($response, 'analytics-collect-401-invalid-key');
});

test('contract: analytics collect forbidden without collect scope', function () {
    $headers = siteCollectHeaders(scopes: ['read']);

    $response = $this->postJson('/api/v1/collect', ['events' => [['name' => 'page_view']]], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-403-scope');
});

test('contract: analytics collect not found when service disabled', function () {
    $headers = siteCollectHeaders(services: []);

    $response = $this->postJson('/api/v1/collect', ['events' => [['name' => 'page_view']]], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-404-service-disabled');
});

test('contract: analytics collect rate limited', function () {
    config(['cms-analytics.collect_rate_limit' => 2]);
    RateLimiter::clear('collect:proj-1');
    $headers = siteCollectHeaders();

    $this->postJson('/api/v1/collect', ['events' => [['name' => 'e1']]], $headers)->assertStatus(202);
    $this->postJson('/api/v1/collect', ['events' => [['name' => 'e2']]], $headers)->assertStatus(202);

    $response = $this->postJson('/api/v1/collect', ['events' => [['name' => 'e3']]], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-429');
});

test('contract: analytics collect rate limit precedes validation', function () {
    // Лимит проверяется раньше разбора payload: даже пустой events даёт 429.
    config(['cms-analytics.collect_rate_limit' => 1]);
    RateLimiter::clear('collect:proj-1');
    $headers = siteCollectHeaders();

    $this->postJson('/api/v1/collect', ['events' => [['name' => 'e1']]], $headers)->assertStatus(202);

    $response = $this->postJson('/api/v1/collect', ['events' => []], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-collect-429-before-validation');
});
