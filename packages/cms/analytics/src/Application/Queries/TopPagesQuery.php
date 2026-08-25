<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Queries;

use Cms\Analytics\Application\DTOs\Report\TopPageRowDTO;
use Cms\Analytics\Domain\Contracts\AnalyticsStore;

final class TopPagesQuery
{
    public function __construct(private readonly AnalyticsStore $store) {}

    /** @return list<TopPageRowDTO> */
    public function handle(string $projectId, string $from, string $to, int $limit = 20): array
    {
        $rows = $this->store->select(
            'SELECT path, countMerge(hits) AS hits, uniqMerge(sessions) AS sessions
             FROM top_pages
             WHERE project_id = :project_id AND date BETWEEN :from AND :to
             GROUP BY path ORDER BY hits DESC LIMIT :limit',
            ['project_id' => $projectId, 'from' => $from, 'to' => $to, 'limit' => $limit],
        );

        return array_map(TopPageRowDTO::fromRow(...), $rows);
    }
}
