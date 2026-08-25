<?php

declare(strict_types=1);

use Cms\Analytics\Infrastructure\Jobs\ExportReportJob;
use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Introspection\Subject;
use Cms\Shared\AuthClient\CachedIntrospector;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

/**
 * Характеризационные снимки admin-контракта analytics (routes/admin.php).
 * Фиксируют текущий формат ответов отчётов до рефакторинга: отчёты отдают
 * строки ClickHouse как есть, ошибки — единым конвертом ErrorEnvelope.
 *
 * ClickHouse в тестовой среде недоступен, поэтому HTTP-интерфейс :8123
 * подменяется Http::fake — тем же приёмом, что в tests/FlushAndReportsTest.php.
 * Все фикстуры — фиксированные литералы, без faker: снимок должен совпадать
 * на любом прогоне.
 */

/** Ответ ClickHouse FORMAT JSON: Connection::select() возвращает ['data'] как есть. */
function fakeClickHouseRows(array $rows): void
{
    Http::fake(['clickhouse:8123*' => Http::response(json_encode(['data' => $rows]), 200)]);
}

/** Introspection произвольного вида — для веток 401/404, не покрытых хелпером пакета. */
function analyticsIntrospectionHeaders(IntrospectionResult $token): array
{
    app()->instance(CachedIntrospector::class, new FakeAnalyticsIntrospector($token, $token));

    return ['Authorization' => 'Bearer test-token'];
}

test('contract: analytics overview success', function () {
    fakeClickHouseRows([
        ['date' => '2026-08-01', 'name' => 'page_view', 'events' => 10, 'sessions' => 4, 'subjects' => 3],
        ['date' => '2026-08-02', 'name' => 'purchase', 'events' => 2, 'sessions' => 2, 'subjects' => 2],
    ]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/analytics/overview?from=2026-08-01&to=2026-08-24',
        $headers,
    );

    ResponseSnapshot::assertMatches($response, 'analytics-overview-200');
});

test('contract: analytics overview passes clickhouse scalars through unchanged', function () {
    // ClickHouse отдаёт 64-битные агрегаты строками; сейчас они проходят насквозь
    // без приведения типов — снимок фиксирует именно это.
    fakeClickHouseRows([
        ['date' => '2026-08-01', 'name' => 'page_view', 'events' => '10', 'sessions' => '4', 'subjects' => '3'],
    ]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/overview', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-overview-200-raw-strings');
});

test('contract: analytics overview empty period', function () {
    fakeClickHouseRows([]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/analytics/overview?from=2026-01-01&to=2026-01-02',
        $headers,
    );

    ResponseSnapshot::assertMatches($response, 'analytics-overview-200-empty');
});

test('contract: analytics overview invalid from', function () {
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/overview?from=01-08-2026', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-overview-422-from');

    // Снимок маскирует значения под ключами from/to (они попадают под шаблон дат),
    // поэтому текст сообщения валидации фиксируется здесь явно.
    expect($response->json('error.details.from'))->toBe(['The from field must match the format Y-m-d.']);
});

test('contract: analytics overview invalid from and to', function () {
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/analytics/overview?from=yesterday&to=2026-13-45',
        $headers,
    );

    ResponseSnapshot::assertMatches($response, 'analytics-overview-422-from-and-to');

    expect($response->json('error.details'))->toBe([
        'from' => ['The from field must match the format Y-m-d.'],
        'to' => ['The to field must match the format Y-m-d.'],
    ]);
});

test('contract: analytics overview unauthenticated without token', function () {
    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/overview');

    ResponseSnapshot::assertMatches($response, 'analytics-overview-401-no-token');
});

test('contract: analytics overview unauthenticated with inactive token', function () {
    $headers = analyticsIntrospectionHeaders(IntrospectionResult::invalid());

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/overview', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-overview-401-inactive-token');
});

test('contract: analytics overview forbidden without permission', function () {
    $headers = actingAsAnalyticsOperator(permissions: []);

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/overview', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-overview-403');
});

test('contract: analytics overview not found for non member', function () {
    // Не-участнику существование проекта не раскрывается: 404, не 403.
    $headers = analyticsIntrospectionHeaders(new IntrospectionResult(
        subject: Subject::Admin,
        active: true,
        projectId: null,
        userId: '1',
        permissions: ['analytics.reports.view'],
        enabledServices: ['analytics'],
    ));

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/overview', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-overview-404-non-member');
});

test('contract: analytics overview not found when service disabled', function () {
    $headers = actingAsAnalyticsOperator(services: []);

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/overview', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-overview-404-service-disabled');
});

test('contract: analytics top pages success', function () {
    fakeClickHouseRows([
        ['path' => '/pricing', 'hits' => 42, 'sessions' => 17],
        ['path' => '/blog/hello', 'hits' => 8, 'sessions' => 6],
    ]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/analytics/top-pages?from=2026-08-01&to=2026-08-24',
        $headers,
    );

    ResponseSnapshot::assertMatches($response, 'analytics-top-pages-200');
});

test('contract: analytics top pages passes clickhouse scalars through unchanged', function () {
    // Предусловие задачи 2.2: countMerge/uniqMerge (UInt64) приходят из ClickHouse
    // СТРОКАМИ. Снимок фиксирует, что тип агрегата отдаётся ровно как пришёл.
    fakeClickHouseRows([
        ['path' => '/pricing', 'hits' => '42', 'sessions' => '17'],
    ]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/top-pages', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-top-pages-200-raw-strings');
});

test('contract: analytics top pages empty', function () {
    fakeClickHouseRows([]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/top-pages', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-top-pages-200-empty');
});

test('contract: analytics top pages invalid to', function () {
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/top-pages?to=24.08.2026', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-top-pages-422-to');

    expect($response->json('error.details.to'))->toBe(['The to field must match the format Y-m-d.']);
});

test('contract: analytics top pages forbidden without permission', function () {
    $headers = actingAsAnalyticsOperator(permissions: ['analytics.history.view']);

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/top-pages', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-top-pages-403');
});

test('contract: analytics revenue success', function () {
    fakeClickHouseRows([
        ['date' => '2026-08-01', 'currency' => 'RUB', 'revenue_minor' => 1250000, 'payments' => 12],
        ['date' => '2026-08-02', 'currency' => 'USD', 'revenue_minor' => 4900, 'payments' => 1],
    ]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/analytics/revenue?from=2026-08-01&to=2026-08-24',
        $headers,
    );

    ResponseSnapshot::assertMatches($response, 'analytics-revenue-200');
});

test('contract: analytics revenue passes clickhouse scalars through unchanged', function () {
    // Предусловие задачи 2.2: sumMerge/countMerge приходят строками — тип сохраняется.
    fakeClickHouseRows([
        ['date' => '2026-08-01', 'currency' => 'RUB', 'revenue_minor' => '1250000', 'payments' => '12'],
    ]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/revenue', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-revenue-200-raw-strings');
});

test('contract: analytics revenue empty', function () {
    fakeClickHouseRows([]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/revenue', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-revenue-200-empty');
});

test('contract: analytics revenue invalid from', function () {
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/revenue?from=2026-08', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-revenue-422-from');

    expect($response->json('error.details.from'))->toBe(['The from field must match the format Y-m-d.']);
});

test('contract: analytics revenue forbidden without permission', function () {
    $headers = actingAsAnalyticsOperator(permissions: []);

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/revenue', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-revenue-403');
});

test('contract: analytics history success', function () {
    fakeClickHouseRows([
        [
            'event_id' => '018f0000-0000-7000-8000-000000000001',
            'occurred_at' => '2026-08-01 10:00:00',
            'name' => 'user.registered',
            'source' => 'service',
            'path' => '',
            'value_minor' => 0,
            'currency' => '',
            'props' => '{}',
        ],
        [
            'event_id' => '018f0000-0000-7000-8000-000000000002',
            'occurred_at' => '2026-08-01 10:05:00',
            'name' => 'purchase',
            'source' => 'site',
            'path' => '/checkout',
            'value_minor' => 4900,
            'currency' => 'RUB',
            'props' => '{"plan":"pro"}',
        ],
    ]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/analytics/history/user:proj-1:5',
        $headers,
    );

    ResponseSnapshot::assertMatches($response, 'analytics-history-200');
});

test('contract: analytics history passes clickhouse scalars through unchanged', function () {
    // Предусловие задачи 2.2: value_minor (Int64) приходит строкой, props — строкой JSON.
    fakeClickHouseRows([
        [
            'event_id' => '018f0000-0000-7000-8000-000000000003',
            'occurred_at' => '2026-08-01 10:00:00',
            'name' => 'purchase',
            'source' => 'site',
            'path' => '/checkout',
            'value_minor' => '4900',
            'currency' => 'RUB',
            'props' => '{"plan":"pro"}',
        ],
    ]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/history/user:proj-1:5', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-history-200-raw-strings');
});

test('contract: analytics history empty for unknown subject', function () {
    fakeClickHouseRows([]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/history/anon:ghost', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-history-200-empty');
});

test('contract: analytics history forbidden without permission', function () {
    $headers = actingAsAnalyticsOperator(permissions: ['analytics.reports.view']);

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/history/user:proj-1:5', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-history-403');
});

test('contract: analytics history unauthenticated', function () {
    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/history/user:proj-1:5');

    ResponseSnapshot::assertMatches($response, 'analytics-history-401');
});

test('contract: analytics unknown admin route', function () {
    // history без subjectKey не совпадает ни с одним маршрутом — конверт 404.
    $headers = actingAsAnalyticsOperator();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/analytics/history', $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-admin-404-unknown-route');
});

test('contract: analytics export accepted', function () {
    Queue::fake([ExportReportJob::class]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/analytics/export',
        ['from' => '2026-08-01', 'to' => '2026-08-24'],
        $headers,
    );

    ResponseSnapshot::assertMatches($response, 'analytics-export-202');
});

test('contract: analytics export accepted with default period', function () {
    Queue::fake([ExportReportJob::class]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->postJson('/api/admin/v1/projects/proj-1/analytics/export', [], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-export-202-default-period');
});

test('contract: analytics export invalid period in query', function () {
    // Канон — query-string (Д12): невалидный период в query даёт 422, как и раньше.
    Queue::fake([ExportReportJob::class]);
    $headers = actingAsAnalyticsOperator();

    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/analytics/export?from=2026/08/01&to=',
        [],
        $headers,
    );

    ResponseSnapshot::assertMatches($response, 'analytics-export-422');

    expect($response->json('error.details.from'))->toBe(['The from field must match the format Y-m-d.']);
});

test('contract: analytics export forbidden without permission', function () {
    Queue::fake([ExportReportJob::class]);
    $headers = actingAsAnalyticsOperator(permissions: ['analytics.reports.view']);

    $response = $this->postJson('/api/admin/v1/projects/proj-1/analytics/export', [], $headers);

    ResponseSnapshot::assertMatches($response, 'analytics-export-403');
});

test('contract: analytics export unauthenticated', function () {
    Queue::fake([ExportReportJob::class]);

    $response = $this->postJson('/api/admin/v1/projects/proj-1/analytics/export', []);

    ResponseSnapshot::assertMatches($response, 'analytics-export-401');
});
