<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\DTOs\Report;

use Spatie\LaravelData\Data;

/**
 * Окно отчёта в формате `Y-m-d`.
 *
 * Дефолт — ровно прежний: `[now-30d; now]` (Safety Protocol, И6 и п. Б1 «поведение,
 * которое обязано остаться прежним»). Границы приходят ТОЛЬКО из query-string —
 * тело запроса источником дат не является, см. `ReportPeriodRequest`.
 */
final class ReportPeriodDTO extends Data
{
    public function __construct(
        public string $from,
        public string $to,
    ) {}

    /**
     * @param  array<string, mixed>  $query  query-string запроса целиком
     */
    public static function fromQuery(array $query): self
    {
        return new self(
            from: (string) ($query['from'] ?? now()->subDays(30)->toDateString()),
            to: (string) ($query['to'] ?? now()->toDateString()),
        );
    }
}
