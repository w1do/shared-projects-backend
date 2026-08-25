<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Queries;

use Cms\Analytics\Application\DTOs\Report\OverviewRowDTO;
use Cms\Analytics\Domain\Contracts\AnalyticsStore;

/** Дашборд ходит только в materialized views, не в сырые события. */
final class OverviewQuery
{
    public function __construct(private readonly AnalyticsStore $store) {}

    /** @return list<OverviewRowDTO> */
    public function handle(string $projectId, string $from, string $to): array
    {
        $rows = $this->store->select(
            'SELECT date, name, countMerge(events) AS events, uniqMerge(sessions) AS sessions, uniqMerge(subjects) AS subjects
             FROM daily_events
             WHERE project_id = :project_id AND date BETWEEN :from AND :to
             GROUP BY date, name ORDER BY date',
            ['project_id' => $projectId, 'from' => $from, 'to' => $to],
        );

        return array_map(OverviewRowDTO::fromRow(...), $rows);
    }
}
