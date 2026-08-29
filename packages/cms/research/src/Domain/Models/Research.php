<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Models;

use Cms\Research\Domain\Enums\ResearchProgressStage;
use Cms\Research\Domain\Enums\ResearchStatus;
use Cms\Research\Domain\Enums\SearchEngine;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Исследование темы: запрос, параметры сбора, состояние и сводный текст.
 *
 * @property int $id
 * @property string $project_id
 * @property string $query
 * @property ?string $offer
 * @property SearchEngine $engine
 * @property int $sub_queries_count
 * @property int $results_per_sub_query
 * @property ResearchStatus $status
 * @property ResearchProgressStage $progress_stage
 * @property ?list<string> $sub_queries
 * @property ?string $summary
 * @property ?string $error_message
 * @property ?Carbon $started_at
 * @property ?Carbon $completed_at
 * @property ?Carbon $indexed_at
 * @property ?string $author_id
 * @property-read Collection<int, ResearchSource> $sources
 * @property-read Collection<int, ResearchTopic> $topics
 */
class Research extends Model
{
    use BelongsToProject;

    protected $table = 'researches';

    protected $fillable = [
        'project_id', 'query', 'offer', 'engine', 'sub_queries_count', 'results_per_sub_query',
        'status', 'progress_stage', 'sub_queries', 'summary', 'error_message',
        'started_at', 'completed_at', 'indexed_at', 'author_id',
    ];

    protected $attributes = ['status' => 'process', 'progress_stage' => 'starting'];

    protected function casts(): array
    {
        return [
            'engine' => SearchEngine::class,
            'status' => ResearchStatus::class,
            'progress_stage' => ResearchProgressStage::class,
            'sub_queries' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'indexed_at' => 'datetime',
        ];
    }

    /** @return HasMany<ResearchSource, $this> */
    public function sources(): HasMany
    {
        return $this->hasMany(ResearchSource::class);
    }

    /** @return HasMany<ResearchTopic, $this> */
    public function topics(): HasMany
    {
        return $this->hasMany(ResearchTopic::class);
    }

    /** @param Builder<$this> $query */
    public function scopeRunning(Builder $query): Builder
    {
        return $query->where('status', ResearchStatus::Process);
    }

    public function isFinished(): bool
    {
        return $this->status->isFinal();
    }

    public function isCanceled(): bool
    {
        return $this->status === ResearchStatus::Canceled;
    }
}
