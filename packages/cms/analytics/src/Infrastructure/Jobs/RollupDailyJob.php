<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Jobs;

use Cms\Analytics\Infrastructure\Persistence\ClickHouse\Connection;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;

/** Ночной OPTIMIZE партиций: схлопывание ReplacingMergeTree и MV. */
final class RollupDailyJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;

    public int $timeout = 600;

    public function handle(Connection $connection): void
    {
        $connection->statement('OPTIMIZE TABLE events FINAL');
    }
}
