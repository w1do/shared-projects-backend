<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Jobs;

use Cms\Content\Domain\Contracts\ContentCache;
use Cms\Shared\Jobs\ProjectAwareJob;

/**
 * Инвалидация публичного кэша контента проекта при публикации/изменении.
 *
 * Зависимость резолвится в `execute()`, а не инъецируется конструктором:
 * конструктор очередной задачи сериализуется в payload, и объект,
 * положенный в очередь до деплоя, приехал бы к воркеру без нового свойства
 * (Safety Protocol, И13). Методная инъекция тоже недоступна — `handle()`
 * базового `ProjectAwareJob` объявлен `final` и вызывает `execute()` напрямую.
 * Контейнер здесь — граница инфраструктуры, а не Application/Domain.
 */
final class PurgeContentCacheJob extends ProjectAwareJob
{
    protected function execute(): void
    {
        app(ContentCache::class)->purge($this->projectId);
    }
}
