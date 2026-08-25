<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Queries;

use Cms\Analytics\Infrastructure\Persistence\ClickHouse\Connection;

/** Выручка — только целые минорные единицы. */
final class RevenueQuery
{
    public function __construct(private readonly Connection $connection) {}

    public function handle(string $projectId, string $from, string $to): array
    {
        return $this->connection->select(sprintf(
            "SELECT date, currency, sumMerge(revenue_minor) AS revenue_minor, countMerge(payments) AS payments
             FROM daily_revenue
             WHERE project_id = '%s' AND date BETWEEN '%s' AND '%s'
             GROUP BY date, currency ORDER BY date",
            addslashes($projectId), addslashes($from), addslashes($to),
        ));
    }
}
