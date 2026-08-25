<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Models;

use Cms\Pay\Database\Factories\PlanFactory;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $project_id
 * @property string $code
 * @property string $name
 * @property int $price_minor
 * @property string $currency
 * @property string $interval
 * @property ?Carbon $archived_at
 */
class Plan extends Model
{
    use BelongsToProject;
    use HasFactory;

    protected $fillable = ['project_id', 'code', 'name', 'price_minor', 'currency', 'interval'];

    protected function casts(): array
    {
        return ['price_minor' => 'int', 'archived_at' => 'datetime'];
    }

    /** @return HasMany<PlanOption, $this> */
    public function options(): HasMany
    {
        return $this->hasMany(PlanOption::class);
    }

    /** @return BelongsToMany<Feature, $this> */
    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class);
    }

    /** @return HasMany<Subscription, $this> */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function isArchived(): bool
    {
        return $this->archived_at !== null;
    }

    /** Длительность одного оплаченного периода. */
    public function periodInterval(): \DateInterval
    {
        return match ($this->interval) {
            'day' => new \DateInterval('P1D'),
            'year' => new \DateInterval('P1Y'),
            default => new \DateInterval('P1M'),
        };
    }

    protected static function newFactory(): PlanFactory
    {
        return PlanFactory::new();
    }
}
