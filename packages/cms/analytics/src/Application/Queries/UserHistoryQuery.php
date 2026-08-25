<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Queries;

use Cms\Analytics\Application\DTOs\Report\UserHistoryRowDTO;
use Cms\Analytics\Domain\Contracts\AnalyticsStore;

/**
 * Полная хронология субъекта: ORDER BY таблицы events включает subject_key,
 * поэтому выборка истории — дешёвый range-scan.
 */
final class UserHistoryQuery
{
    public function __construct(private readonly AnalyticsStore $store) {}

    /** @return list<UserHistoryRowDTO> */
    public function handle(string $projectId, string $subjectKey, int $limit = 500): array
    {
        $rows = $this->store->select(
            'SELECT event_id, occurred_at, name, source, path, value_minor, currency, props
             FROM events FINAL
             WHERE project_id = :project_id AND subject_key = :subject_key
             ORDER BY occurred_at ASC LIMIT :limit',
            ['project_id' => $projectId, 'subject_key' => $subjectKey, 'limit' => $limit],
        );

        return array_map(UserHistoryRowDTO::fromRow(...), $rows);
    }
}
