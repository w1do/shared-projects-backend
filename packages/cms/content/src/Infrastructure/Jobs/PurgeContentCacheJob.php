<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Jobs;

use Cms\Content\Infrastructure\Support\ContentCache;
use Cms\Shared\Tenant\ProjectAwareJob;

/** Инвалидация публичного кэша контента проекта при публикации/изменении. */
final class PurgeContentCacheJob extends ProjectAwareJob
{
    protected function execute(): void
    {
        app(ContentCache::class)->purge($this->projectId);
    }
}
