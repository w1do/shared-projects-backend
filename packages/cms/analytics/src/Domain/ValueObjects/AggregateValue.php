<?php

declare(strict_types=1);

namespace Cms\Analytics\Domain\ValueObjects;

/**
 * Значение агрегата аналитического хранилища.
 *
 * ClickHouse отдаёт 64-битные агрегаты (`countMerge`/`uniqMerge`/`sumMerge`, UInt64/Int64)
 * СТРОКАМИ, чтобы не терять точность на границе JSON; фикстуры тестовой среды отдают их
 * числами. Приведение к одному типу изменило бы публичный контракт отчётов, поэтому int
 * и string проходят насквозь ровно теми, какими пришли из хранилища.
 *
 * Остальные типы недостижимы для агрегатных колонок (`countMerge`/`uniqMerge`/`sumMerge`
 * и `Int64 value_minor` не бывают ни null, ни float) и приводятся защитно: float — к int,
 * всё прочее — к 0, чтобы битая строка ответа не роняла типизацию отчёта.
 */
final class AggregateValue
{
    public static function fromRaw(mixed $raw): int|string
    {
        return match (true) {
            is_int($raw), is_string($raw) => $raw,
            is_float($raw) => (int) $raw,
            default => 0,
        };
    }
}
