<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\UpdateProjectCommand;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Infrastructure\Support\Audit;
use Cms\Auth\Infrastructure\Support\BootstrapCache;
use Spatie\LaravelData\Optional;

final class UpdateProjectHandler
{
    public function handle(UpdateProjectCommand $command): Project
    {
        $changes = array_filter([
            'name' => $command->data->name instanceof Optional ? null : $command->data->name,
            'locales' => $command->data->locales instanceof Optional ? null : $command->data->locales,
        ], fn ($v) => $v !== null);

        $before = $command->project->only(array_keys($changes));
        $command->project->fill($changes)->save();

        Audit::record('project.updated', $command->project->id, "project:{$command->project->key}", ['before' => $before, 'after' => $changes]);
        BootstrapCache::bump();

        return $command->project;
    }
}
