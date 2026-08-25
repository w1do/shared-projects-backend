<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Queries;

use Cms\Analytics\Infrastructure\Persistence\ClickHouse\Connection;

/**
 * Полная хронология субъекта: ORDER BY таблицы events включает subject_key,
 * поэтому выборка истории — дешёвый range-scan.
 */
final class UserHistoryQuery
{
    public function __construct(private readonly Connection $connection) {}

    public function handle(string $projectId, string $subjectKey, int $limit = 500): array
    {
        return $this->connection->select(sprintf(
            "SELECT event_id, occurred_at, name, source, path, value_minor, currency, props
             FROM events FINAL
             WHERE project_id = '%s' AND subject_key = '%s'
             ORDER BY occurred_at ASC LIMIT %d",
            addslashes($projectId), addslashes($subjectKey), $limit,
        ));
    }
}
