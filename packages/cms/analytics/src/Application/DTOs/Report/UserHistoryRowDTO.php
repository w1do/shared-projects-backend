<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\DTOs\Report;

use Cms\Analytics\Domain\ValueObjects\AggregateValue;
use Spatie\LaravelData\Data;

/**
 * Строка хронологии субъекта.
 *
 * `props` — строка JSON, как её хранит ClickHouse (колонка String), а не массив:
 * панель получает ровно то, что записал приёмник событий.
 */
final class UserHistoryRowDTO extends Data
{
    public function __construct(
        public string $event_id,
        public string $occurred_at,
        public string $name,
        public string $source,
        public string $path,
        public int|string $value_minor,
        public string $currency,
        public string $props,
    ) {}

    /** @param  array<string, mixed>  $row */
    public static function fromRow(array $row): self
    {
        return new self(
            event_id: (string) ($row['event_id'] ?? ''),
            occurred_at: (string) ($row['occurred_at'] ?? ''),
            name: (string) ($row['name'] ?? ''),
            source: (string) ($row['source'] ?? ''),
            path: (string) ($row['path'] ?? ''),
            value_minor: AggregateValue::fromRaw($row['value_minor'] ?? 0),
            currency: (string) ($row['currency'] ?? ''),
            props: (string) ($row['props'] ?? '{}'),
        );
    }
}
