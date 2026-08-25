<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\DTOs\Report;

use Cms\Analytics\Domain\ValueObjects\AggregateValue;
use Spatie\LaravelData\Data;

/** Строка отчёта «обзор»: срез daily_events по дате и имени события. */
final class OverviewRowDTO extends Data
{
    public function __construct(
        public string $date,
        public string $name,
        public int|string $events,
        public int|string $sessions,
        public int|string $subjects,
    ) {}

    /** @param  array<string, mixed>  $row */
    public static function fromRow(array $row): self
    {
        return new self(
            date: (string) ($row['date'] ?? ''),
            name: (string) ($row['name'] ?? ''),
            events: AggregateValue::fromRaw($row['events'] ?? 0),
            sessions: AggregateValue::fromRaw($row['sessions'] ?? 0),
            subjects: AggregateValue::fromRaw($row['subjects'] ?? 0),
        );
    }
}
