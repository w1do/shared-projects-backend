<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Models;

use Cms\Research\Domain\Enums\BuildoutStatus;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Сборка проекта по AI: состояние, которое опрашивает консоль.
 *
 * @property int $id
 * @property string $project_id
 * @property string $topic
 * @property BuildoutStatus $status
 * @property bool $overwrite
 * @property int $categories_created
 * @property bool $project_updated
 * @property ?string $error_message
 * @property ?Carbon $completed_at
 * @property ?string $author_id
 */
class ProjectBuildout extends Model
{
    use BelongsToProject;

    protected $fillable = [
        'project_id', 'topic', 'status', 'overwrite',
        'categories_created', 'project_updated', 'error_message', 'completed_at', 'author_id',
    ];

    protected $attributes = ['status' => 'process', 'overwrite' => false, 'categories_created' => 0, 'project_updated' => false];

    protected function casts(): array
    {
        return [
            'status' => BuildoutStatus::class,
            'overwrite' => 'bool',
            'project_updated' => 'bool',
            'completed_at' => 'datetime',
        ];
    }

    /** @param Builder<$this> $query */
    public function scopeRunning(Builder $query): Builder
    {
        return $query->where('status', BuildoutStatus::Process);
    }
}
