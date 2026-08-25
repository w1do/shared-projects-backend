<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Jobs;

use Cms\Analytics\Application\Queries\OverviewQuery;
use Cms\Shared\Tenant\ProjectAwareJob;
use Illuminate\Support\Facades\Storage;

/** Экспорт отчёта — всегда асинхронно; готовый файл выдаётся позже. */
final class ExportReportJob extends ProjectAwareJob
{
    public int $timeout = 300;

    public function __construct(string $projectId, public readonly string $from, public readonly string $to)
    {
        parent::__construct($projectId);
    }

    protected function execute(): void
    {
        $rows = app(OverviewQuery::class)->handle($this->projectId, $this->from, $this->to);

        $csv = "date,name,events,sessions,subjects\n";
        foreach ($rows as $row) {
            $csv .= sprintf("%s,%s,%d,%d,%d\n", $row['date'], $row['name'], $row['events'], $row['sessions'], $row['subjects']);
        }

        Storage::disk('local')->put("exports/{$this->projectId}/overview_{$this->from}_{$this->to}.csv", $csv);
    }
}
