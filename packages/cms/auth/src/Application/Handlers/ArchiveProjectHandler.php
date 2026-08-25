<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\ArchiveProjectCommand;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;

/** Архивация: данные сохраняются, проект выводится из работы. */
final class ArchiveProjectHandler
{
    public function __construct(
        private readonly AuditRecorder $audit,
    ) {}

    public function handle(ArchiveProjectCommand $command): Project
    {
        $command->project->forceFill(['archived_at' => now()])->save();

        $this->audit->record(AuditAction::ProjectArchived, $command->project->id, "project:{$command->project->key}");
        BootstrapCache::bump();

        return $command->project;
    }
}
