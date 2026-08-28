<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Models;

use Cms\Licensing\Database\Factories\OrganizationFactory;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Организация-покупатель self-hosted-поставки: анкета + полиморфный
 * подписчик подписок pay (морф-алиас `organization`).
 *
 * @property int $id
 * @property string $project_id
 * @property string $name
 * @property string $contact_first_name
 * @property string $contact_last_name
 * @property ?string $phone
 * @property string $email
 * @property ?string $telegram
 * @property ?string $activity
 * @property ?int $employees_count
 * @property ?string $usage_purpose
 */
class Organization extends Model
{
    use BelongsToProject;
    use HasFactory;

    protected $table = 'licensing_organizations';

    protected $fillable = [
        'project_id', 'name', 'contact_first_name', 'contact_last_name',
        'phone', 'email', 'telegram', 'activity', 'employees_count', 'usage_purpose',
    ];

    protected function casts(): array
    {
        return ['employees_count' => 'int'];
    }

    /** @return HasMany<License, $this> */
    public function licenses(): HasMany
    {
        return $this->hasMany(License::class, 'organization_id');
    }

    /** @return HasMany<PlanFeature, $this> */
    public function featureOverrides(): HasMany
    {
        return $this->hasMany(PlanFeature::class, 'organization_id');
    }

    protected static function newFactory(): OrganizationFactory
    {
        return OrganizationFactory::new();
    }
}
