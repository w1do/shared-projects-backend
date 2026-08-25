<?php

declare(strict_types=1);

namespace Cms\Analytics\Console;

use Cms\Analytics\Application\Commands\FlushBufferCommand;
use Cms\Analytics\Application\Handlers\FlushBufferHandler;
use Cms\Analytics\Infrastructure\Support\EventBuffer;
use Illuminate\Console\Command;

/**
 * Демон Supervisor (один экземпляр — два дают дубли в батчах):
 * batch = config('batch_size') событий ИЛИ flush_interval секунд.
 */
final class FlushCommand extends Command
{
    protected $signature = 'analytics:flush {--daemon} {--once}';

    protected $description = 'Flush the analytics buffer into ClickHouse in batches';

    public function handle(FlushBufferHandler $flush, EventBuffer $buffer): int
    {
        $interval = (int) config('cms-analytics.flush_interval', 2);

        do {
            $result = $flush->handle(new FlushBufferCommand);
            if ($result['flushed'] > 0 || $result['dead'] > 0) {
                $this->info(sprintf('flushed=%d dead=%d buffer=%d', $result['flushed'], $result['dead'], $buffer->size()));
            }

            if ($this->option('daemon')) {
                sleep($interval);
            }
        } while ($this->option('daemon'));

        return self::SUCCESS;
    }
}
