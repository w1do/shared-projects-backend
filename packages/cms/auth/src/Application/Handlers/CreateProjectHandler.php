<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\CreateProjectCommand;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Infrastructure\Support\Audit;
use Cms\Auth\Infrastructure\Support\BootstrapCache;
use Cms\Auth\Infrastructure\Support\PermissionSyncer;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\Optional;
use Spatie\Permission\PermissionRegistrar;

final class CreateProjectHandler
{
    public function __construct(
        private readonly PermissionSyncer $syncer,
        private readonly PermissionRegistrar $registrar,
    ) {}

    public function handle(CreateProjectCommand $command): Project
    {
        $project = DB::transaction(function () use ($command) {
            $project = Project::create([
                'key' => $command->data->key,
                'name' => $command->data->name,
                'locales' => $command->data->locales instanceof Optional ? ['ru'] : $command->data->locales,
            ]);
            $project->members()->attach($command->creator->id);

            $this->syncer->syncSystemRoles($project);

            $this->registrar->setPermissionsTeamId($project->id);
            try {
                $command->creator->assignRole('owner');
            } finally {
                $this->registrar->setPermissionsTeamId(null);
            }

            return $project;
        });

        Audit::record('project.created', $project->id, "project:{$project->key}");
        BootstrapCache::bump();

        return $project;
    }
}
