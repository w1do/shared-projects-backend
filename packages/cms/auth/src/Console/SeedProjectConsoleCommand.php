<?php

declare(strict_types=1);

namespace Cms\Auth\Console;

use Cms\Auth\Application\Commands\CreateProjectCommand;
use Cms\Auth\Application\Commands\ToggleServiceCommand;
use Cms\Auth\Application\DTOs\Project\CreateProjectDTO;
use Cms\Auth\Application\Handlers\CreateProjectHandler;
use Cms\Auth\Application\Handlers\ToggleServiceHandler;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Illuminate\Console\Command;

/**
 * Бутстрап-команда стека: стартовый проект с включёнными сервисами.
 * Без проекта консоль не показывает ни одного раздела (bootstrap собирается
 * из включённых сервисов текущего проекта).
 */
final class SeedProjectConsoleCommand extends Command
{
    protected $signature = 'project:seed';

    protected $description = 'Seed the initial project with enabled services (idempotent)';

    public function handle(CreateProjectHandler $create, ToggleServiceHandler $toggle): int
    {
        if (Project::query()->exists()) {
            $this->info('Projects already exist — project seed skipped.');

            return self::SUCCESS;
        }

        $owner = Admin::query()->orderBy('id')->first();

        if ($owner === null) {
            $this->warn('No operator found — run operator:seed first.');

            return self::SUCCESS;
        }

        $project = $create->handle(new CreateProjectCommand(
            CreateProjectDTO::from([
                'key' => (string) config('cms-auth.initial_project.key'),
                'name' => (string) config('cms-auth.initial_project.name'),
                'locales' => (array) config('cms-auth.initial_project.locales', ['ru']),
            ]),
            $owner,
        ));

        foreach ((array) config('cms-auth.services', []) as $service) {
            $toggle->handle(new ToggleServiceCommand($project, (string) $service, true));
        }

        $this->info("Project '{$project->key}' created with all services enabled.");

        return self::SUCCESS;
    }
}
