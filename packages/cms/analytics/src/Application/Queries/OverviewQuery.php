<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Queries;

use Cms\Analytics\Infrastructure\Persistence\ClickHouse\Connection;

/** Дашборд ходит только в materialized views, не в сырые события. */
final class OverviewQuery
{
    public function __construct(private readonly Connection $connection) {}

    public function handle(string $projectId, string $from, string $to): array
    {
        return $this->connection->select(sprintf(
            "SELECT date, name, countMerge(events) AS events, uniqMerge(sessions) AS sessions, uniqMerge(subjects) AS subjects
             FROM daily_events
             WHERE project_id = '%s' AND date BETWEEN '%s' AND '%s'
             GROUP BY date, name ORDER BY date",
            addslashes($projectId), addslashes($from), addslashes($to),
        ));
    }
}
