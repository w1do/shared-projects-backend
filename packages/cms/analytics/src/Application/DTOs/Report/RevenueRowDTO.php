<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\DTOs\Report;

use Cms\Analytics\Domain\ValueObjects\AggregateValue;
use Spatie\LaravelData\Data;

/** Строка отчёта «выручка»: только целые минорные единицы, без float. */
final class RevenueRowDTO extends Data
{
    public function __construct(
        public string $date,
        public string $currency,
        public int|string $revenue_minor,
        public int|string $payments,
    ) {}

    /** @param  array<string, mixed>  $row */
    public static function fromRow(array $row): self
    {
        return new self(
            date: (string) ($row['date'] ?? ''),
            currency: (string) ($row['currency'] ?? ''),
            revenue_minor: AggregateValue::fromRaw($row['revenue_minor'] ?? 0),
            payments: AggregateValue::fromRaw($row['payments'] ?? 0),
        );
    }
}
