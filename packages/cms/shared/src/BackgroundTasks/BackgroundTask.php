<?php

declare(strict_types=1);

namespace Cms\Shared\BackgroundTasks;

use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Запись реестра фоновых задач проекта: что запущено, кем, на каком этапе
 * и чем закончилось.
 *
 * @property int $id
 * @property string $project_id
 * @property BackgroundTaskKind $kind
 * @property BackgroundTaskState $state
 * @property ?string $stage
 * @property ?string $subject_type
 * @property ?string $subject_id
 * @property ?string $initiated_by
 * @property ?string $failure_reason
 * @property ?Carbon $queued_at
 * @property ?Carbon $started_at
 * @property ?Carbon $finished_at
 */
class BackgroundTask extends Model
{
    use BelongsToProject;

    protected $fillable = [
        'project_id', 'kind', 'state', 'stage', 'subject_type', 'subject_id',
        'initiated_by', 'failure_reason', 'queued_at', 'started_at', 'finished_at',
    ];

    protected $attributes = ['state' => 'queued'];

    protected function casts(): array
    {
        return [
            'kind' => BackgroundTaskKind::class,
            'state' => BackgroundTaskState::class,
            'queued_at' => 'datetime',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    /** @param  Builder<$this>  $query */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('state', [BackgroundTaskState::Queued, BackgroundTaskState::Running]);
    }

    /** @param  Builder<$this>  $query */
    public function scopeFinishedAfter(Builder $query, Carbon $since): Builder
    {
        return $query->whereNotNull('finished_at')->where('finished_at', '>=', $since);
    }
}
