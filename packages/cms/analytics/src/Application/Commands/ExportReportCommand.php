<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Commands;

use Cms\Analytics\Application\DTOs\Report\ReportPeriodDTO;

/** Команда-намерение: данные для ExportReportHandler. */
final readonly class ExportReportCommand
{
    public function __construct(
        public string $projectId,
        public ReportPeriodDTO $period,
    ) {}
}
