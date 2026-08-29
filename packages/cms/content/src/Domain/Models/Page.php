<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Models;

use Cms\Content\Database\Factories\PageFactory;
use Cms\Content\Domain\Enums\ContentStatus;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
 * @property ContentStatus $status
 * @property ?Carbon $published_at
 * @property bool $is_index
 * @property-read ?SeoMeta $seo
 */
class Page extends Model
{
    use BelongsToProject;
    use HasFactory;

    protected $fillable = ['project_id', 'title', 'slug', 'body', 'locale', 'status', 'published_at', 'is_index'];

    protected $attributes = ['is_index' => true, 'status' => 'draft', 'locale' => 'ru'];

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
            'is_index' => 'bool',
        ];
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

    /**
     * Поля, попадающие в снимок ревизии: у страницы нет блоков содержимого.
     *
     * @return array<string, mixed>
     */
    public function revisionSnapshot(): array
    {
        return $this->only(['title', 'slug', 'body', 'locale', 'status']);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ContentStatus::Published);
    }

    protected static function newFactory(): PageFactory
    {
        return PageFactory::new();
    }
}
