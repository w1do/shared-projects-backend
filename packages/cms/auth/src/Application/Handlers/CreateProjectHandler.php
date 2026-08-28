<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\CreateProjectCommand;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Enums\SystemRole;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectService;
use Cms\Auth\Infrastructure\Persistence\AdminPermissionResolver;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;
use Cms\Auth\Infrastructure\Persistence\PermissionSyncer;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\Optional;

final class CreateProjectHandler
{
    public function __construct(
        private readonly PermissionSyncer $syncer,
        private readonly AdminPermissionResolver $permissions,
        private readonly AuditRecorder $audit,
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

            foreach ((array) config('cms-auth.default_enabled_services', []) as $service) {
                ProjectService::create([
                    'project_id' => $project->id,
                    'service' => $service,
                    'enabled' => true,
                    'enabled_at' => now(),
                ]);
            }

            // Сброс в null, а не восстановление предыдущего — поведение сохранено дословно (9.2).
            $this->permissions->withTeam($project->id, function () use ($command): void {
                $command->creator->assignRole(SystemRole::Owner->value);
            });

            return $project;
        });

        $this->audit->record(AuditAction::ProjectCreated, $project->id, "project:{$project->key}");
        BootstrapCache::bump();

        return $project;
    }
}
