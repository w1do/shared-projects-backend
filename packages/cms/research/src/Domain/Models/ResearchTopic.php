<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Models;

use Cms\Research\Domain\Enums\TopicStatus;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Тема поста, выведенная из материалов исследования.
 *
 * @property int $id
 * @property string $project_id
 * @property int $research_id
 * @property string $title
 * @property ?string $rationale
 * @property ?int $category_id
 * @property ?string $suggested_category
 * @property TopicStatus $status
 * @property ?int $post_id
 */
class ResearchTopic extends Model
{
    use BelongsToProject;

    protected $fillable = [
        'project_id', 'research_id', 'title', 'rationale',
        'category_id', 'suggested_category', 'status', 'post_id',
    ];

    protected $attributes = ['status' => 'suggested'];

    protected function casts(): array
    {
        return ['status' => TopicStatus::class];
    }

    /** @return BelongsTo<Research, $this> */
    public function research(): BelongsTo
    {
        return $this->belongsTo(Research::class);
    }

    /** @param Builder<$this> $query */
    public function scopeSuggested(Builder $query): Builder
    {
        return $query->where('status', TopicStatus::Suggested);
    }

    public function isSuggested(): bool
    {
        return $this->status === TopicStatus::Suggested;
    }
}
