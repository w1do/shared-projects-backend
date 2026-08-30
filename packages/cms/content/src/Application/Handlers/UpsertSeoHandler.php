<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\UpsertSeoCommand;
use Cms\Content\Domain\Models\SeoMeta;
use Cms\Content\Infrastructure\Jobs\RegenerateSitemapJob;

final class UpsertSeoHandler
{
    public function handle(UpsertSeoCommand $command): SeoMeta
    {
        /** @var SeoMeta $seo */
        $seo = $command->model->seo()->firstOrNew([]);
        // Справочный город проекту не принадлежит: project_id проставит контекст.
        $seo->project_id ??= $command->model->getAttribute('project_id');
        $seo->fill($command->data->toArray());
        $seo->save();

        RegenerateSitemapJob::dispatch($seo->project_id);

        return $seo;
    }
}
