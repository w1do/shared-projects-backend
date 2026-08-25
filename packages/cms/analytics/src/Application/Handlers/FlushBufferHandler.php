<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Handlers;

use Cms\Analytics\Application\Commands\FlushBufferCommand;
use Cms\Analytics\Infrastructure\Persistence\ClickHouse\Connection;
use Cms\Analytics\Infrastructure\Support\EventBuffer;
use Illuminate\Support\Facades\Log;

/**
 * Снятие пачки из буфера → батч-INSERT в ClickHouse.
 * LTRIM только после успешного INSERT; ошибка → dead-letter, приём не страдает.
 */
final class FlushBufferHandler
{
    public function __construct(
        private readonly EventBuffer $buffer,
        private readonly Connection $connection,
    ) {}

    /** @return array{flushed: int, dead: int} */
    public function handle(FlushBufferCommand $command): array
    {
        $batchSize = $command->batchSize ?? (int) config('cms-analytics.batch_size', 5000);
        $rows = $this->buffer->peek($batchSize);

        if ($rows === []) {
            return ['flushed' => 0, 'dead' => 0];
        }

        try {
            $this->connection->insertBatch('events', $rows);
            $this->buffer->commit(count($rows));

            return ['flushed' => count($rows), 'dead' => 0];
        } catch (\Throwable $e) {
            Log::error('analytics flush failed, moving batch to dead-letter', ['exception' => $e->getMessage()]);
            $this->buffer->moveToDeadLetter(count($rows));

            return ['flushed' => 0, 'dead' => count($rows)];
        }
    }
}
