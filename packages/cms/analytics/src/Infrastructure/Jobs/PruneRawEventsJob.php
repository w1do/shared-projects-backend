<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Jobs;

use Cms\Analytics\Infrastructure\Persistence\ClickHouse\Connection;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;

/** Принудительный прогон TTL-чистки (обычно ClickHouse делает это сам). */
final class PruneRawEventsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;

    public int $timeout = 600;

    public function handle(Connection $connection): void
    {
        $connection->statement('ALTER TABLE events MATERIALIZE TTL');
    }
}
