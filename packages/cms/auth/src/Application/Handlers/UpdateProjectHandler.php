<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\UpdateProjectCommand;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;
use Spatie\LaravelData\Optional;

final class UpdateProjectHandler
{
    public function __construct(
        private readonly AuditRecorder $audit,
    ) {}

    public function handle(UpdateProjectCommand $command): Project
    {
        // «Поле не передано» ≠ «поле = null»: непереданное отбрасывается по типу
        // Optional, а явный null сбрасывает значение.
        $changes = array_filter([
            'name' => $command->data->name,
            'locales' => $command->data->locales,
            'description' => $command->data->description,
            'topic' => $command->data->topic,
        ], fn ($v) => ! $v instanceof Optional);

        $before = $command->project->only(array_keys($changes));
        $command->project->fill($changes)->save();

        $this->audit->record(AuditAction::ProjectUpdated, $command->project->id, "project:{$command->project->key}", ['before' => $before, 'after' => $changes]);
        BootstrapCache::bump();

        return $command->project;
    }
}
