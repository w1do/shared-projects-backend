<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Jobs;

use Cms\Content\Infrastructure\Support\SitemapGenerator;
use Cms\Shared\Tenant\ProjectAwareJob;
use Illuminate\Contracts\Queue\ShouldBeUnique;

/** Асинхронная регенерация sitemap.xml проекта; уникальна на проект. */
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
