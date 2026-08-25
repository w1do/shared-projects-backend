<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Queries;

use Cms\Analytics\Infrastructure\Persistence\ClickHouse\Connection;

final class TopPagesQuery
{
    public function __construct(private readonly Connection $connection) {}

    public function handle(string $projectId, string $from, string $to, int $limit = 20): array
    {
        return $this->connection->select(sprintf(
            "SELECT path, countMerge(hits) AS hits, uniqMerge(sessions) AS sessions
             FROM top_pages
             WHERE project_id = '%s' AND date BETWEEN '%s' AND '%s'
             GROUP BY path ORDER BY hits DESC LIMIT %d",
            addslashes($projectId), addslashes($from), addslashes($to), $limit,
        ));
    }
}
