<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\SetProjectProfileCommand;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Описание и тематика проекта, заполненные сборкой по AI.
 *
 * Уже заполненное поле не затирается без явного согласия оператора, поэтому
 * повторное применение той же сборки идемпотентно.
 */
final class SetProjectProfileHandler
{
    public function __construct(private readonly AuditRecorder $audit) {}

    public function handle(SetProjectProfileCommand $command): Project
    {
        $project = Project::query()->whereKey($command->projectId)->first();

        if ($project === null) {
            throw (new ModelNotFoundException)->setModel(Project::class, [$command->projectId]);
        }

        $changes = [];

        foreach (['description' => $command->description, 'topic' => $command->topic] as $field => $value) {
            if ($value === null || trim($value) === '') {
                continue;
            }

            $current = $project->getAttribute($field);

            if (! $command->overwrite && is_string($current) && trim($current) !== '') {
                continue;
            }

            $changes[$field] = $value;
        }

        if ($changes === []) {
            return $project;
        }

        $before = $project->only(array_keys($changes));
        $project->fill($changes)->save();

        $this->audit->record(
            AuditAction::ProjectUpdated,
            $project->id,
            "project:{$project->key}",
            ['before' => $before, 'after' => $changes],
        );
        BootstrapCache::bump();

        return $project;
    }
}
