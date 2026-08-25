<?php

declare(strict_types=1);

use Cms\Analytics\Application\Commands\FlushBufferCommand;
use Cms\Analytics\Application\Commands\RecordEventsCommand;
use Cms\Analytics\Application\Handlers\FlushBufferHandler;
use Cms\Analytics\Application\Handlers\RecordEventsHandler;
use Cms\Analytics\Infrastructure\Jobs\ExportReportJob;
use Cms\Analytics\Infrastructure\Persistence\EventBuffer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Redis;

beforeEach(function () {
    Redis::del('analytics:buffer', 'analytics:dead');
});

function bufferEvents(int $count): void
{
    $events = [];
    foreach (range(1, $count) as $i) {
        $events[] = ['name' => 'page_view', 'session_id' => "s{$i}"];
    }
    app(RecordEventsHandler::class)->handle(new RecordEventsCommand('proj-1', $events, 'site'));
}

test('flush inserts a batch into clickhouse and trims the buffer only on success', function () {
    Http::fake(['clickhouse:8123*' => Http::response('', 200)]);
    bufferEvents(3);

    $result = app(FlushBufferHandler::class)->handle(new FlushBufferCommand);

    expect($result->toArray())->toBe(['flushed' => 3, 'dead' => 0])
        ->and(app(EventBuffer::class)->size())->toBe(0);

    Http::assertSent(fn ($request) => str_contains($request->url(), 'INSERT+INTO+events')
        || str_contains(urldecode($request->url()), 'INSERT INTO events'));
});

test('failed insert moves the batch to dead-letter and keeps accepting events', function () {
    Http::fake(['clickhouse:8123*' => Http::response('boom', 500)]);
    bufferEvents(2);

    $result = app(FlushBufferHandler::class)->handle(new FlushBufferCommand);

    $buffer = app(EventBuffer::class);
    expect($result->dead)->toBe(2)
        ->and($buffer->size())->toBe(0)
        ->and($buffer->deadSize())->toBe(2);

    // приём продолжает работать
    bufferEvents(1);
    expect($buffer->size())->toBe(1);
});

test('replay returns dead-letter events to the buffer and flush retries them', function () {
    // Первый INSERT падает, после восстановления — успех
    Http::fake(['clickhouse:8123*' => Http::sequence()
        ->push('boom', 500)
        ->whenEmpty(Http::response('', 200))]);
    bufferEvents(2);
    app(FlushBufferHandler::class)->handle(new FlushBufferCommand);
    expect(app(EventBuffer::class)->deadSize())->toBe(2);

    // ClickHouse восстановился
    $replayed = app(EventBuffer::class)->replay();
    $result = app(FlushBufferHandler::class)->handle(new FlushBufferCommand);

    expect($replayed)->toBe(2)
        ->and($result->flushed)->toBe(2)
        ->and(app(EventBuffer::class)->deadSize())->toBe(0);
});

test('overview report queries materialized views scoped by project', function () {
    Http::fake(['clickhouse:8123*' => Http::response(json_encode([
        'data' => [['date' => '2026-08-01', 'name' => 'page_view', 'events' => 10, 'sessions' => 4, 'subjects' => 3]],
    ]), 200)]);

    $headers = actingAsAnalyticsOperator();

    $this->getJson('/api/admin/v1/projects/proj-1/analytics/overview?from=2026-08-01&to=2026-08-24', $headers)
        ->assertOk()
        ->assertJsonPath('data.0.events', 10);

    Http::assertSent(function ($request) {
        $body = (string) $request->body();

        return str_contains($body, 'daily_events') && str_contains($body, "project_id = 'proj-1'");
    });
});

test('user history is ordered chronology for a subject key', function () {
    Http::fake(['clickhouse:8123*' => Http::response(json_encode(['data' => [
        ['event_id' => 'e1', 'occurred_at' => '2026-08-01 10:00:00', 'name' => 'user.registered'],
        ['event_id' => 'e2', 'occurred_at' => '2026-08-01 10:05:00', 'name' => 'user.login'],
    ]]), 200)]);

    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/history/user:proj-1:5', $headers)->assertOk();

    expect($response->json('data.0.name'))->toBe('user.registered')
        ->and($response->json('data.1.name'))->toBe('user.login');

    Http::assertSent(fn ($request) => str_contains((string) $request->body(), "subject_key = 'user:proj-1:5'"));
});

test('operator without permission cannot view reports', function () {
    $headers = actingAsAnalyticsOperator(permissions: []);

    $this->getJson('/api/admin/v1/projects/proj-1/analytics/overview', $headers)->assertStatus(403);
});

test('export runs asynchronously on the exports queue', function () {
    Queue::fake([ExportReportJob::class]);
    $headers = actingAsAnalyticsOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/analytics/export', [], $headers)->assertStatus(202);

    Queue::assertPushedOn('exports', ExportReportJob::class);
});

test('duplicate event ids are deduplicated by replacing merge tree ordering', function () {
    // Дедупликация: повторный flush того же батча даёт те же event_id —
    // ReplacingMergeTree(received_at) с event_id в ORDER BY схлопывает дубликаты.
    Http::fake(['clickhouse:8123*' => Http::response('', 200)]);

    app(RecordEventsHandler::class)->handle(new RecordEventsCommand('proj-1', [
        ['name' => 'page_view', 'event_id' => '018f0000-0000-7000-8000-000000000001'],
    ], 'site'));
    app(FlushBufferHandler::class)->handle(new FlushBufferCommand);

    // повторная отправка того же события (retry сайта)
    app(RecordEventsHandler::class)->handle(new RecordEventsCommand('proj-1', [
        ['name' => 'page_view', 'event_id' => '018f0000-0000-7000-8000-000000000001'],
    ], 'site'));
    app(FlushBufferHandler::class)->handle(new FlushBufferCommand);

    $bodies = [];
    Http::assertSent(function ($request) use (&$bodies) {
        $bodies[] = (string) $request->body();

        return true;
    });
    $inserts = array_filter($bodies, fn ($b) => str_contains($b, '018f0000-0000-7000-8000-000000000001'));

    // Оба INSERT несут одинаковый event_id — финальную дедупликацию выполняет движок таблицы
    expect(count($inserts))->toBe(2);
});
