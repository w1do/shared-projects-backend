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
        $seo->project_id = $command->model->project_id;
        $seo->fill($command->data->toArray());
        $seo->save();

        RegenerateSitemapJob::dispatch($command->model->project_id);

        return $seo;
    }
}
