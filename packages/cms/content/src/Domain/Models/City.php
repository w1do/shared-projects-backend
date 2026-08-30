<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

/**
 * Город справочника: общий на платформу, проекту не принадлежит (Decision Д1).
 *
 * @property int $id
 * @property int $region_id
 * @property string $name
 * @property string $slug
 * @property int $population
 * @property ?string $latitude
 * @property ?string $longitude
 * @property-read Region $region
 * @property-read ?SeoMeta $seo
 *
 * @mixin Builder<City>
 */
class City extends Model
{
    use HasSlug;

    protected $fillable = ['region_id', 'name', 'slug', 'population', 'latitude', 'longitude'];

    protected $attributes = ['population' => 0];

    protected function casts(): array
    {
        return ['population' => 'int', 'latitude' => 'decimal:7', 'longitude' => 'decimal:7'];
    }

    /**
     * Слаг источника (латиница словаря) сохраняется как есть; своего слага нет —
     * собирается из названия и разводится суффиксом на городах-тёзках.
     */
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug')
            ->preventOverwrite();
    }

    /** @return BelongsTo<Region, $this> */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    /** @return HasMany<ProjectCity, $this> */
    public function enrollments(): HasMany
    {
        return $this->hasMany(ProjectCity::class);
    }

    /** @return MorphOne<SeoMeta, $this> */
    public function seo(): MorphOne
    {
        return $this->morphOne(SeoMeta::class, 'seoable');
    }
}
