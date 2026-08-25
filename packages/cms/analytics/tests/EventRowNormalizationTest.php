<?php

declare(strict_types=1);

use Cms\Analytics\Application\Commands\RecordEventsCommand;
use Cms\Analytics\Application\Handlers\RecordEventsHandler;
use Cms\Analytics\Infrastructure\Persistence\EventBuffer;
use Illuminate\Support\Facades\Redis;

/**
 * Контракт нормализации события: состав, ПОРЯДОК и типы колонок строки батча.
 *
 * Строка уходит в ClickHouse как есть (`INSERT ... FORMAT JSONEachRow`), поэтому
 * лишний, потерянный или переименованный ключ ломает вставку в проде, а снимок
 * HTTP-ответа этого класса поломок не видит: `/collect` отвечает 202 в любом случае.
 */
beforeEach(function () {
    Redis::del('analytics:buffer', 'analytics:dead');
});

test('normalized event row keeps the exact clickhouse column set, order and types', function () {
    config(['cms-analytics.ip_salt' => 'salt-1']);

    app(RecordEventsHandler::class)->handle(new RecordEventsCommand(
        projectId: 'proj-1',
        events: [[
            'name' => 'purchase',
            'event_id' => '018f0000-0000-7000-8000-000000000001',
            'occurred_at' => '2026-08-01T10:00:00+00:00',
            'subject_key' => 'user:proj-1:5',
            'session_id' => 's1',
            'path' => '/checkout',
            'referrer' => 'https://example.test/',
            'utm_source' => 'ya',
            'utm_medium' => 'cpc',
            'utm_campaign' => 'august',
            'value_minor' => 4900,
            'currency' => null,
            'props' => ['plan' => 'pro'],
        ]],
        source: 'site',
        ip: '203.0.113.10',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0',
    ));

    $row = app(EventBuffer::class)->peek(1)[0];

    expect(array_keys($row))->toBe([
        'project_id', 'event_id', 'occurred_at', 'name', 'source', 'subject_key',
        'session_id', 'path', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign',
        'device', 'os', 'browser', 'ip_hash', 'value_minor', 'currency', 'props',
    ]);

    expect($row['project_id'])->toBe('proj-1')
        ->and($row['event_id'])->toBe('018f0000-0000-7000-8000-000000000001')
        ->and($row['occurred_at'])->toBe('2026-08-01 10:00:00')
        ->and($row['name'])->toBe('purchase')
        ->and($row['source'])->toBe('site')
        ->and($row['subject_key'])->toBe('user:proj-1:5')
        ->and($row['session_id'])->toBe('s1')
        ->and($row['path'])->toBe('/checkout')
        ->and($row['referrer'])->toBe('https://example.test/')
        ->and($row['utm_source'])->toBe('ya')
        ->and($row['utm_medium'])->toBe('cpc')
        ->and($row['utm_campaign'])->toBe('august')
        ->and($row['device'])->toBe('desktop')
        ->and($row['os'])->toBe('windows')
        ->and($row['browser'])->toBe('chrome')
        ->and($row['ip_hash'])->toHaveLength(64)
        ->and($row['value_minor'])->toBe(4900)
        ->and($row['currency'])->toBe('')
        ->and($row['props'])->toBe('{"plan":"pro"}');
});

test('normalized event row falls back to column defaults for a bare event', function () {
    app(RecordEventsHandler::class)->handle(new RecordEventsCommand('proj-1', [['name' => 'page_view']], 'service'));

    $row = app(EventBuffer::class)->peek(1)[0];

    expect($row['subject_key'])->toBe('anon:unknown')
        ->and($row['session_id'])->toBe('')
        ->and($row['path'])->toBe('')
        ->and($row['value_minor'])->toBe(0)
        ->and($row['currency'])->toBe('')
        ->and($row['props'])->toBe('[]')
        ->and($row['ip_hash'])->toBe('')
        ->and($row['device'])->toBe('desktop')
        ->and($row['os'])->toBe('other')
        ->and($row['browser'])->toBe('other')
        ->and($row['event_id'])->not->toBe('');
});
