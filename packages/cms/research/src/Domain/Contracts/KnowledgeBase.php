<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Contracts;

use Cms\Research\Domain\ValueObjects\KnowledgeFilter;
use Cms\Research\Domain\ValueObjects\KnowledgeHit;
use Cms\Research\Domain\ValueObjects\KnowledgePoint;

/**
 * Порт базы знаний проекта.
 *
 * `projectId` — обязательный параметр каждого метода, а не неявный контекст:
 * материал одного проекта не может попасть в выдачу другого ни при каком вызове.
 */
interface KnowledgeBase
{
    /** Создание хранилища под текущую размерность векторов; повтор безопасен. */
    public function provision(): void;

    /**
     * Запись точек проекта. Идентификатор точки детерминирован, поэтому повторная
     * запись того же материала не создаёт дубликата.
     *
     * @param  list<KnowledgePoint>  $points
     * @return int число записанных точек
     */
    public function upsert(string $projectId, array $points): int;

    /**
     * Смысловой поиск по базе знаний проекта.
     *
     * @param  list<float>  $vector
     * @return list<KnowledgeHit>
     */
    public function search(string $projectId, array $vector, int $limit, ?KnowledgeFilter $filter = null): array;

    /** Удаление всех записей проекта. */
    public function forget(string $projectId): void;
}
