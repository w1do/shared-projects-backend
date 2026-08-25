<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Models;

use Cms\Content\Database\Factories\PostFactory;
use Cms\Content\Domain\Enums\ContentStatus;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $project_id
 * @property string $title
 * @property string $slug
 * @property ?string $body
 * @property string $locale
 * @property ?string $translation_group
 * @property ContentStatus $status
 * @property ?Carbon $scheduled_at
 * @property ?Carbon $published_at
 * @property bool $is_index
 * @property ?string $author_id
 * @property-read ?SeoMeta $seo
 * @property-read Collection<int, Category> $categories
 */
class Post extends Model
{
    use BelongsToProject;
    use HasFactory;

    protected $fillable = [
        'project_id', 'title', 'slug', 'body', 'locale', 'translation_group',
        'status', 'scheduled_at', 'published_at', 'is_index', 'author_id',
    ];

    protected $attributes = ['is_index' => true, 'status' => 'draft', 'locale' => 'ru'];

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'scheduled_at' => 'datetime',
            'published_at' => 'datetime',
            'is_index' => 'bool',
        ];
    }

    /** @return BelongsToMany<Category, $this> */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    /** @return MorphOne<SeoMeta, $this> */
    public function seo(): MorphOne
    {
        return $this->morphOne(SeoMeta::class, 'seoable');
    }

    /** @return MorphMany<Revision, $this> */
    public function revisions(): MorphMany
    {
        return $this->morphMany(Revision::class, 'revisable');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ContentStatus::Published);
    }

    public function isPublished(): bool
    {
        return $this->status === ContentStatus::Published;
    }

    protected static function newFactory(): PostFactory
    {
        return PostFactory::new();
    }
}
