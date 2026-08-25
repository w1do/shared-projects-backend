<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Handlers;

use Cms\Analytics\Application\Commands\ExportReportCommand;
use Cms\Analytics\Infrastructure\Jobs\ExportReportJob;

/**
 * Экспорт отчёта — всегда асинхронно: очередь `exports`, отдельная от приёма событий.
 * Постановка задачи — единственный эффект; файл собирается в джобе.
 */
final class ExportReportHandler
{
    public function handle(ExportReportCommand $command): void
    {
        ExportReportJob::dispatch($command->projectId, $command->period->from, $command->period->to)
            ->onQueue('exports');
    }
}
