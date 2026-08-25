<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Jobs;

use Cms\Content\Infrastructure\Seo\SitemapGenerator;
use Cms\Shared\Jobs\ProjectAwareJob;
use Illuminate\Contracts\Queue\ShouldBeUnique;

/**
 * Асинхронная регенерация sitemap.xml проекта; уникальна на проект.
 *
 * Про резолв зависимости в `execute()` — см. докблок `PurgeContentCacheJob`:
 * конструкторная инъекция уехала бы в payload очереди (И13), а методная
 * закрыта `final handle()` замороженного `ProjectAwareJob`.
 */
final class RegenerateSitemapJob extends ProjectAwareJob implements ShouldBeUnique
{
    public int $uniqueFor = 60;

    public function uniqueId(): string
    {
        return 'sitemap:'.$this->projectId;
    }

    protected function execute(): void
    {
        app(SitemapGenerator::class)->generate($this->projectId);
    }
}
