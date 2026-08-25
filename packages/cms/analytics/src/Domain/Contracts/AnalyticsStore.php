<?php

declare(strict_types=1);

namespace Cms\Analytics\Domain\Contracts;

/**
 * Порт аналитического хранилища (в проде — ClickHouse).
 *
 * Application слой знает только про этот интерфейс: конкретный
 * `Infrastructure\Persistence\ClickHouse\Connection` подставляется провайдером.
 */
interface AnalyticsStore
{
    /**
     * SELECT: строки результата как ассоциативные массивы.
     *
     * @param  array<string, scalar>  $params  именованные параметры запроса (`:name`)
     * @return list<array<string, mixed>>
     */
    public function select(string $sql, array $params = []): array;

    /**
     * Батч-вставка строк. Одиночные INSERT запрещены by design.
     *
     * @param  list<array<string, mixed>>  $rows
     */
    public function insertBatch(string $table, array $rows): void;
}
