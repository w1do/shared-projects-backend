<?php

declare(strict_types=1);

namespace Cms\Shared\Settings;

use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Database\Eloquent\Builder;
use Spatie\LaravelSettings\SettingsRepositories\DatabaseSettingsRepository;

/**
 * Tenant-scoped хранилище spatie/laravel-settings: каждая строка `settings`
 * принадлежит проекту (unique project_id+group+name).
 *
 * Контекст читается из scoped ProjectContext на каждом обращении, а не в
 * конструкторе: инстанс репозитория создаётся фабрикой spatie и может пережить
 * запрос под Octane — захваченный контекст был бы чужим.
 */
final class ProjectDatabaseSettingsRepository extends DatabaseSettingsRepository
{
    public function getBuilder(): Builder
    {
        return parent::getBuilder()->where('project_id', $this->projectId());
    }

    /** @param mixed $payload */
    public function createProperty(string $group, string $name, $payload, bool $locked = false): void
    {
        parent::getBuilder()->create([
            'project_id' => $this->projectId(),
            'group' => $group,
            'name' => $name,
            'payload' => $this->encode($payload),
            'locked' => $locked,
        ]);
    }

    public function updatePropertiesPayload(string $group, array $properties): void
    {
        $projectId = $this->projectId();

        $rows = collect($properties)->map(fn (mixed $payload, string $name): array => [
            'project_id' => $projectId,
            'group' => $group,
            'name' => $name,
            'payload' => $this->encode($payload),
        ])->values()->toArray();

        // conflict target обязан совпадать с реальным уникальным индексом —
        // у tenant-таблицы это (project_id, group, name)
        parent::getBuilder()->upsert($rows, ['project_id', 'group', 'name'], ['payload']);
    }

    private function projectId(): string
    {
        return app(ProjectContext::class)->required();
    }
}
