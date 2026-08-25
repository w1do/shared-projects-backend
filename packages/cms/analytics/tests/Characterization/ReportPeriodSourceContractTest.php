<?php

declare(strict_types=1);

use Cms\Analytics\Infrastructure\Jobs\ExportReportJob;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

/**
 * Задача 0.9 — источник дат отчётов.
 *
 * Канон (Д12, change fix-known-behavioral-defects): период берётся ТОЛЬКО из
 * query-string — `ReportPeriodRequest` и валидирует, и читает `query()`.
 * Тело запроса игнорируется целиком: даты в теле (валидные или нет) не влияют
 * ни на статус, ни на окно джобы — экспорт ставится с дефолтным окном.
 *
 * Дефолтное окно — [now()-30d; now()] в формате Y-m-d, без учёта времени суток.
 * Время фиксируется Carbon::setTestNow, чтобы дефолт был литералом, а не «сегодня».
 *
 * ClickHouse подменяется Http::fake на :8123 — тем же приёмом, что в
 * tests/FlushAndReportsTest.php и ReportsContractTest.php; SQL уходит в тело
 * POST-запроса (Connection::select → withBody($sql.' FORMAT JSON')).
 */

/** Фиксированное «сейчас»: 2026-08-25 → дефолтное окно [2026-07-26; 2026-08-25]. */
const PERIOD_NOW = '2026-08-25 12:34:56';

const PERIOD_DEFAULT_FROM = '2026-07-26';

const PERIOD_DEFAULT_TO = '2026-08-25';

beforeEach(function () {
    Carbon::setTestNow(PERIOD_NOW);
});

afterEach(function () {
    Carbon::setTestNow();
});

/** Единственная поставленная в очередь джоба экспорта. */
function pushedExportJob(): ExportReportJob
{
    $jobs = [];
    Queue::assertPushed(ExportReportJob::class, function (ExportReportJob $job) use (&$jobs) {
        $jobs[] = $job;

        return true;
    });

    expect($jobs)->toHaveCount(1);

    return $jobs[0];
}

/** Тела всех запросов к ClickHouse (SQL уходит телом POST). */
function clickHouseSqlBodies(): array
{
    $bodies = [];
    Http::assertSent(function ($request) use (&$bodies) {
        $bodies[] = (string) $request->body();

        return true;
    });

    return $bodies;
}

test('guard: 0.9 export ignores period in json body and queues the default window', function () {
    // (a) даты в теле — джоба получает ДЕФОЛТНОЕ окно: тело не является источником дат.
    Queue::fake([ExportReportJob::class]);
    $headers = actingAsAnalyticsOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/analytics/export', [
        'from' => '2026-01-01',
        'to' => '2026-01-31',
    ], $headers)->assertStatus(202);

    $job = pushedExportJob();

    expect($job->projectId)->toBe('proj-1')
        ->and($job->from)->toBe(PERIOD_DEFAULT_FROM)
        ->and($job->to)->toBe(PERIOD_DEFAULT_TO);

    Queue::assertPushedOn('exports', ExportReportJob::class);
});

test('guard: 0.9 export takes period from the query string', function () {
    // (b) те же даты в query-string — джоба получает именно их.
    Queue::fake([ExportReportJob::class]);
    $headers = actingAsAnalyticsOperator();

    $this->postJson(
        '/api/admin/v1/projects/proj-1/analytics/export?from=2026-01-01&to=2026-01-31',
        [],
        $headers,
    )->assertStatus(202);

    $job = pushedExportJob();

    expect($job->from)->toBe('2026-01-01')
        ->and($job->to)->toBe('2026-01-31');
});

test('guard: 0.9 export query string wins over json body for the same keys', function () {
    // Query-string и тело противоречат друг другу — побеждает query-string.
    Queue::fake([ExportReportJob::class]);
    $headers = actingAsAnalyticsOperator();

    $this->postJson(
        '/api/admin/v1/projects/proj-1/analytics/export?from=2026-03-01&to=2026-03-31',
        ['from' => '2026-01-01', 'to' => '2026-01-31'],
        $headers,
    )->assertStatus(202);

    $job = pushedExportJob();

    expect($job->from)->toBe('2026-03-01')
        ->and($job->to)->toBe('2026-03-31');
});

test('guard: 0.9 export ignores the json body entirely', function () {
    // Канон — query-string (Д12): тело не валидируется и не читается,
    // невалидная дата в теле — 202 и джоба с дефолтным окном.
    Queue::fake([ExportReportJob::class]);
    $headers = actingAsAnalyticsOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/analytics/export', [
        'from' => 'not-a-date',
    ], $headers)->assertStatus(202);

    $job = pushedExportJob();

    expect($job->from)->toBe(PERIOD_DEFAULT_FROM)
        ->and($job->to)->toBe(PERIOD_DEFAULT_TO);
});

test('guard: 0.9 overview without dates queries clickhouse for the default window', function () {
    // (c) дефолт [now-30d; now] доезжает до SQL, а не только до ответа.
    Http::fake(['clickhouse:8123*' => Http::response(json_encode(['data' => []]), 200)]);
    $headers = actingAsAnalyticsOperator();

    $this->getJson('/api/admin/v1/projects/proj-1/analytics/overview', $headers)->assertOk();

    $bodies = clickHouseSqlBodies();

    expect($bodies)->toHaveCount(1)
        ->and($bodies[0])->toContain("project_id = 'proj-1'")
        ->and($bodies[0])->toContain(
            "date BETWEEN '".PERIOD_DEFAULT_FROM."' AND '".PERIOD_DEFAULT_TO."'",
        );
});

test('guard: 0.9 overview with explicit query dates passes them into clickhouse', function () {
    Http::fake(['clickhouse:8123*' => Http::response(json_encode(['data' => []]), 200)]);
    $headers = actingAsAnalyticsOperator();

    $this->getJson(
        '/api/admin/v1/projects/proj-1/analytics/overview?from=2026-02-01&to=2026-02-28',
        $headers,
    )->assertOk();

    $bodies = clickHouseSqlBodies();

    expect($bodies)->toHaveCount(1)
        ->and($bodies[0])->toContain("date BETWEEN '2026-02-01' AND '2026-02-28'");
});

test('guard: 0.9 overview rejects an invalid from with 422 naming the key in error details', function () {
    // (d) невалидная дата в query-string: 422 до похода в ClickHouse.
    Http::fake(['clickhouse:8123*' => Http::response(json_encode(['data' => []]), 200)]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/overview?from=not-a-date', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-overview-422-from-not-a-date');

    expect($response->json('error.code'))->toBe('validation_failed')
        ->and(array_keys((array) $response->json('error.details')))->toBe(['from'])
        ->and($response->json('error.details.from'))->toBe(['The from field must match the format Y-m-d.']);

    Http::assertNothingSent();
});
