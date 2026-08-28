<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Models;

use Cms\Licensing\Database\Factories\PlanFeatureFactory;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Фича лицензионного плана (Д4): `organization_id IS NULL` — базовая фича
 * плана; заполненный — дополнительная фича плана для конкретной организации.
 *
 * @property int $id
 * @property string $project_id
 * @property int $plan_id
 * @property ?int $organization_id
 * @property string $code
 * @property string $name
 */
class PlanFeature extends Model
{
    use BelongsToProject;
    use HasFactory;

    protected $table = 'license_plan_features';

    protected $fillable = ['project_id', 'plan_id', 'organization_id', 'code', 'name'];

    /** @return BelongsTo<Plan, $this> */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    public function isBase(): bool
    {
        return $this->organization_id === null;
    }

    protected static function newFactory(): PlanFeatureFactory
    {
        return PlanFeatureFactory::new();
    }
}
