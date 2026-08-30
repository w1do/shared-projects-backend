<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Регион справочника: общий на платформу, проекту не принадлежит (Decision Д1).
 *
 * @property int $id
 * @property string $name
 * @property ?string $federal_district
 */
class Region extends Model
{
    protected $fillable = ['name', 'federal_district'];

    /** @return HasMany<City, $this> */
    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }
}
