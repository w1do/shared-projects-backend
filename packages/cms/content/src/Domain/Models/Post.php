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
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Support\Carbon;
use Spatie\Tags\HasTags;

/**
 * @property int $id
 * @property string $project_id
 * @property string $title
 * @property string $slug
 * @property ?string $body
 * @property list<array{id: string, title: string, markdown: string}> $blocks
 * @property string $locale
 * @property ?string $translation_group
 * @property ContentStatus $status
 * @property ?Carbon $scheduled_at
 * @property ?Carbon $published_at
 * @property bool $is_index
 * @property ?string $author_id
 * @property ?int $cover_media_id
 * @property ?int $banner_media_id
 * @property-read ?SeoMeta $seo
 * @property-read ?MediaFile $cover
 * @property-read ?MediaFile $banner
 * @property-read Collection<int, Category> $categories
 */
class Post extends Model
{
    use BelongsToProject;
    use HasFactory;
    use HasTags;

    protected $fillable = [
        'project_id', 'title', 'slug', 'body', 'locale', 'translation_group',
        'status', 'scheduled_at', 'published_at', 'is_index', 'author_id',
        'cover_media_id', 'banner_media_id', 'blocks',
    ];

    protected $attributes = ['is_index' => true, 'status' => 'draft', 'locale' => 'ru'];

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'scheduled_at' => 'datetime',
            'published_at' => 'datetime',
            'is_index' => 'bool',
            'blocks' => 'array',
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

    /** @return BelongsTo<MediaFile, $this> */
    public function cover(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'cover_media_id');
    }

    /** @return BelongsTo<MediaFile, $this> */
    public function banner(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'banner_media_id');
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

    /**
     * Поля, попадающие в снимок ревизии: состав задаёт сама модель, иначе
     * общий обработчик клал бы в снимок страницы её несуществующие поля.
     *
     * @return array<string, mixed>
     */
    public function revisionSnapshot(): array
    {
        return $this->only(['title', 'slug', 'body', 'blocks', 'locale', 'status']);
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
