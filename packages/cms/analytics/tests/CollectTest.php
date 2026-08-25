<?php

declare(strict_types=1);

use Cms\Analytics\Infrastructure\Persistence\EventBuffer;
use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Introspection\Subject;
use Cms\Shared\AuthClient\Introspector;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Redis;

beforeEach(function () {
    Redis::del('analytics:buffer', 'analytics:dead');
});

test('collect accepts events with 202 and pushes them to the buffer', function () {
    $headers = siteCollectHeaders();

    $this->postJson('/api/v1/collect', ['events' => [
        ['name' => 'page_view', 'path' => '/pricing', 'session_id' => 's1', 'anon_id' => 'a1'],
    ]], $headers)->assertStatus(202);

    $buffer = app(EventBuffer::class);
    expect($buffer->size())->toBe(1);

    $event = $buffer->peek(1)[0];
    expect($event['project_id'])->toBe('proj-1')
        ->and($event['name'])->toBe('page_view')
        ->and($event['subject_key'])->toBe('anon:a1')
        ->and($event['device'])->toBe('desktop');
});

test('raw ip never reaches the buffer, only a salted hash', function () {
    $headers = siteCollectHeaders();
    config(['cms-analytics.ip_salt' => 'salt-1']);

    $this->postJson('/api/v1/collect', ['events' => [['name' => 'page_view']]], $headers)->assertStatus(202);

    $event = app(EventBuffer::class)->peek(1)[0];
    expect($event['ip_hash'])->toHaveLength(64)
        ->and(json_encode($event))->not->toContain('127.0.0.1');
});

test('invalid api key gets 401', function () {
    $invalid = new IntrospectionResult(subject: Subject::Invalid, active: false);
    app()->instance(Introspector::class, new FakeAnalyticsIntrospector($invalid, $invalid));

    $this->postJson('/api/v1/collect', ['events' => [['name' => 'x']]], ['X-Api-Key' => 'bad'])
        ->assertStatus(401);

    expect(app(EventBuffer::class)->size())->toBe(0);
});

test('key without collect scope gets 403', function () {
    $headers = siteCollectHeaders(scopes: ['other']);

    $this->postJson('/api/v1/collect', ['events' => [['name' => 'x']]], $headers)->assertStatus(403);
});

test('disabled analytics service returns 404', function () {
    $headers = siteCollectHeaders(services: []);

    $this->postJson('/api/v1/collect', ['events' => [['name' => 'x']]], $headers)->assertNotFound();
});

test('bot user agents are accepted but not stored', function () {
    $headers = siteCollectHeaders();
    $headers['User-Agent'] = 'Googlebot/2.1 (+http://www.google.com/bot.html)';

    $this->postJson('/api/v1/collect', ['events' => [['name' => 'page_view']]], $headers)->assertStatus(202);

    expect(app(EventBuffer::class)->size())->toBe(0);
});

test('collect is rate limited with 429', function () {
    config(['cms-analytics.collect_rate_limit' => 2]);
    RateLimiter::clear('collect:proj-1');
    $headers = siteCollectHeaders();

    $this->postJson('/api/v1/collect', ['events' => [['name' => 'e1']]], $headers)->assertStatus(202);
    $this->postJson('/api/v1/collect', ['events' => [['name' => 'e2']]], $headers)->assertStatus(202);
    $this->postJson('/api/v1/collect', ['events' => [['name' => 'e3']]], $headers)->assertStatus(429);
});

test('internal events endpoint requires a service token and accepts platform events', function () {
    config(['cms.service_token' => 'svc-1']);

    $payload = ['events' => [[
        'project_id' => 'proj-1', 'name' => 'user.registered',
        'subject_key' => 'user:proj-1:5', 'event_id' => (string) Str::uuid(),
        'occurred_at' => now()->toIso8601String(),
    ]]];

    $this->postJson('/internal/events', $payload)->assertStatus(401);

    $this->postJson('/internal/events', $payload, ['Authorization' => 'Service svc-1'])->assertStatus(202);

    $event = app(EventBuffer::class)->peek(1)[0];
    expect($event['subject_key'])->toBe('user:proj-1:5')->and($event['source'])->toBe('service');
});
