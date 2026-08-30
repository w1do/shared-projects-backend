<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Models;

use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Включённость города в проекте: выключённый город остаётся строкой со снятым
 * флагом — по наличию строк видно, что стартовый набор уже применён.
 *
 * @property int $id
 * @property string $project_id
 * @property int $city_id
 * @property bool $enabled
 * @property-read City $city
 */
class ProjectCity extends Model
{
    use BelongsToProject;

    protected $fillable = ['project_id', 'city_id', 'enabled'];

    protected $attributes = ['enabled' => true];

    protected function casts(): array
    {
        return ['enabled' => 'bool'];
    }

    /** @return BelongsTo<City, $this> */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}
