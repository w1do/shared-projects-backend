<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Contracts;

use Closure;

/**
 * Порт кэша публичных ответов контента.
 *
 * Application знает только про «запомнить на проект» и «сбросить проект»;
 * стратегия (версия на проект, TTL, драйвер) — дело адаптера.
 */
interface ContentCache
{
    /** Значение по ключу проекта; при промахе вычисляется и запоминается. */
    public function remember(string $projectId, string $key, Closure $resolve): mixed;

    /** Инвалидация всех закэшированных ответов проекта. */
    public function purge(string $projectId): void;
}
