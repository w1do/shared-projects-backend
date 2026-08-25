<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\ArchiveProjectCommand;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Infrastructure\Support\Audit;
use Cms\Auth\Infrastructure\Support\BootstrapCache;

/** Архивация: данные сохраняются, проект выводится из работы. */
final class ArchiveProjectHandler
{
    public function handle(ArchiveProjectCommand $command): Project
    {
        $command->project->forceFill(['archived_at' => now()])->save();

        Audit::record('project.archived', $command->project->id, "project:{$command->project->key}");
        BootstrapCache::bump();

        return $command->project;
    }
}
