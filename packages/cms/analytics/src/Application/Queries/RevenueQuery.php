<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Queries;

use Cms\Analytics\Application\DTOs\Report\RevenueRowDTO;
use Cms\Analytics\Domain\Contracts\AnalyticsStore;

/** Выручка — только целые минорные единицы. */
final class RevenueQuery
{
    public function __construct(private readonly AnalyticsStore $store) {}

    /** @return list<RevenueRowDTO> */
    public function handle(string $projectId, string $from, string $to): array
    {
        $rows = $this->store->select(
            'SELECT date, currency, sumMerge(revenue_minor) AS revenue_minor, countMerge(payments) AS payments
             FROM daily_revenue
             WHERE project_id = :project_id AND date BETWEEN :from AND :to
             GROUP BY date, currency ORDER BY date',
            ['project_id' => $projectId, 'from' => $from, 'to' => $to],
        );

        return array_map(RevenueRowDTO::fromRow(...), $rows);
    }
}
