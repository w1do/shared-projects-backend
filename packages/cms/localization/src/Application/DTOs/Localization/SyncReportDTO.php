<?php

declare(strict_types=1);

namespace Cms\Localization\Application\DTOs\Localization;

use Spatie\LaravelData\Data;

/** Отчёт localize:sync: сколько строк добавлено/обновлено и по скольким проектам. */
final class SyncReportDTO extends Data
{
    public function __construct(
        public int $added,
        public int $updated,
        public int $unchanged,
        public int $projects,
    ) {}
}
