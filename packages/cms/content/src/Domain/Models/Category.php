<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Models;

use Cms\Content\Database\Factories\CategoryFactory;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Kalnoy\Nestedset\Collection;
use Kalnoy\Nestedset\NodeTrait;
use Kalnoy\Nestedset\QueryBuilder;
use Spatie\Translatable\HasTranslations;

/**
 * Категория — узел nested set в пределах проекта.
 *
 * @property int $id
 * @property string $project_id
 * @property string $name
 * @property string $slug
 * @property ?int $parent_id
 * @property bool $is_index
 * @property array<string, bool> $name_machine локали, заполненные автопереводом
 * @property-read ?SeoMeta $seo
 * @property-read Collection<int, Category> $children
 *
 * @mixin QueryBuilder
 */
class Category extends Model
{
    use BelongsToProject;
    use HasFactory;
    use HasTranslations;
    use NodeTrait;

    /** Имя хранит значения по локалям проекта; slug остаётся единым. */
    public array $translatable = ['name'];

    protected $fillable = ['project_id', 'name', 'slug', 'parent_id', 'is_index', 'name_machine'];

    protected $attributes = ['is_index' => true];

    protected function casts(): array
    {
        return ['is_index' => 'bool', 'name_machine' => 'array'];
    }

    /** Дерево скоупится проектом: nested set индексы независимы между проектами. */
    protected function getScopeAttributes(): array
    {
        return ['project_id'];
    }

    /**
     * Перемещение под указанный узел замкнуло бы дерево: это сам узел или
     * его собственный потомок.
     */
    public function wouldCycleUnder(self $parent): bool
    {
        return $parent->getKey() === $this->getKey() || $parent->isDescendantOf($this);
    }

    /** @return BelongsToMany<Post, $this> */
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class);
    }

    /** @return MorphOne<SeoMeta, $this> */
    public function seo(): MorphOne
    {
        return $this->morphOne(SeoMeta::class, 'seoable');
    }

    protected static function newFactory(): CategoryFactory
    {
        return CategoryFactory::new();
    }
}
