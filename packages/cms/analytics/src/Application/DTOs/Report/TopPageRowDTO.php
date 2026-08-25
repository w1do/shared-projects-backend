<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\DTOs\Report;

use Cms\Analytics\Domain\ValueObjects\AggregateValue;
use Spatie\LaravelData\Data;

/** Строка отчёта «топ страниц»: путь и агрегаты посещений. */
final class TopPageRowDTO extends Data
{
    public function __construct(
        public string $path,
        public int|string $hits,
        public int|string $sessions,
    ) {}

    /** @param  array<string, mixed>  $row */
    public static function fromRow(array $row): self
    {
        return new self(
            path: (string) ($row['path'] ?? ''),
            hits: AggregateValue::fromRaw($row['hits'] ?? 0),
            sessions: AggregateValue::fromRaw($row['sessions'] ?? 0),
        );
    }
}
