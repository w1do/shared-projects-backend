<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Support;

use Illuminate\Support\Facades\Redis;

/**
 * Устойчивый буфер событий: Redis LIST (appendonly переживает рестарт).
 * ClickHouse из HTTP-запроса не трогается никогда — только RPUSH сюда.
 */
final class EventBuffer
{
    private const KEY = 'analytics:buffer';

    private const DEAD = 'analytics:dead';

    public function push(array $event): void
    {
        Redis::rpush(self::KEY, json_encode($event, JSON_UNESCAPED_UNICODE));
    }

    /** @return list<array> снятая пачка (LRANGE, LTRIM — только после успешной записи) */
    public function peek(int $batchSize): array
    {
        $raw = Redis::lrange(self::KEY, 0, $batchSize - 1);

        return array_values(array_filter(array_map(fn ($row) => json_decode((string) $row, true), $raw)));
    }

    /** Подтверждение успешной записи батча. */
    public function commit(int $count): void
    {
        if ($count > 0) {
            Redis::ltrim(self::KEY, $count, -1);
        }
    }

    /** Ошибка записи: батч перемещается в dead-letter, приём продолжает работать. */
    public function moveToDeadLetter(int $count): void
    {
        $raw = Redis::lrange(self::KEY, 0, $count - 1);
        if ($raw !== []) {
            Redis::rpush(self::DEAD, ...$raw);
            Redis::ltrim(self::KEY, $count, -1);
        }
    }

    /** Возврат dead-letter в основной буфер (replay). */
    public function replay(): int
    {
        $count = 0;
        while (true) {
            $row = Redis::lpop(self::DEAD);
            if (! is_string($row)) {
                break;
            }
            Redis::rpush(self::KEY, $row);
            $count++;
        }

        return $count;
    }

    public function size(): int
    {
        return (int) Redis::llen(self::KEY);
    }

    public function deadSize(): int
    {
        return (int) Redis::llen(self::DEAD);
    }
}
