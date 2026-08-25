<?php

declare(strict_types=1);

use Cms\Analytics\Infrastructure\Jobs\ExportReportJob;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

/**
 * Тело ExportReportJob раньше не выполнял ни один тест: очередь всегда фейкалась
 * (`Queue::fake`), поэтому джоба проверялась только по факту постановки.
 *
 * Здесь джоба выполняется по-настоящему — через контейнер, то есть ровно так, как её
 * выполнит воркер: это гейт для методной инъекции зависимостей (задача 2.7).
 */
test('export job renders the overview report into a csv artifact', function () {
    Storage::fake('local');
    Http::fake(['clickhouse:8123*' => Http::response(json_encode(['data' => [
        ['date' => '2026-08-01', 'name' => 'page_view', 'events' => '10', 'sessions' => '4', 'subjects' => '3'],
        ['date' => '2026-08-02', 'name' => 'purchase', 'events' => 2, 'sessions' => 2, 'subjects' => 2],
    ]]), 200)]);

    // Контейнер подставляет OverviewQuery и ProjectContext — конструктор их не несёт.
    app()->call([new ExportReportJob('proj-1', '2026-08-01', '2026-08-24'), 'handle']);

    Storage::disk('local')->assertExists('exports/proj-1/overview_2026-08-01_2026-08-24.csv');

    expect(Storage::disk('local')->get('exports/proj-1/overview_2026-08-01_2026-08-24.csv'))->toBe(
        "date,name,events,sessions,subjects\n"
        ."2026-08-01,page_view,10,4,3\n"
        ."2026-08-02,purchase,2,2,2\n",
    );

    // Контекст проекта выставляется на время работы и снимается после неё.
    expect(app(ProjectContext::class)->resolved())->toBeFalse();

    Http::assertSent(fn ($request) => str_contains((string) $request->body(), "project_id = 'proj-1'")
        && str_contains((string) $request->body(), "date BETWEEN '2026-08-01' AND '2026-08-24'"));
});
