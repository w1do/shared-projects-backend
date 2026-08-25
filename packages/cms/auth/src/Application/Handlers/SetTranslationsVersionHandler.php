<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\SetTranslationsVersionCommand;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;
use Illuminate\Contracts\Cache\Repository as CacheRepository;

/**
 * Content-service сообщает новую версию переводов проекта.
 *
 * Версия хранится вечно (её заменяет следующее уведомление), а bootstrap-кэш
 * сбрасывается сразу: панель обязана увидеть новую версию тем же запросом,
 * которым читает манифест консоли.
 */
final class SetTranslationsVersionHandler
{
    public function __construct(private readonly CacheRepository $cache) {}

    public function handle(SetTranslationsVersionCommand $command): void
    {
        $this->cache->forever('translations:version:'.$command->projectId, $command->version);

        BootstrapCache::bump();
    }
}
