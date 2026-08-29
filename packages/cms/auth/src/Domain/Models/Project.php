<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Models;

use Cms\Auth\Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $key
 * @property string $name
 * @property ?string $description
 * @property ?string $topic
 * @property list<string> $locales
 * @property ?Carbon $archived_at
 */
class Project extends Model
{
    use HasFactory;
    use HasUlids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['key', 'name', 'description', 'topic', 'locales'];

    protected function casts(): array
    {
        return ['locales' => 'array', 'archived_at' => 'datetime'];
    }

    /** @return BelongsToMany<Admin, $this> */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Admin::class, 'project_members', 'project_id', 'admin_id')->withTimestamps();
    }

    /** @return HasMany<ProjectApiKey, $this> */
    public function apiKeys(): HasMany
    {
        return $this->hasMany(ProjectApiKey::class);
    }

    /** @return HasMany<ProjectService, $this> */
    public function services(): HasMany
    {
        return $this->hasMany(ProjectService::class);
    }

    /** @return HasMany<ProjectSetting, $this> */
    public function settings(): HasMany
    {
        return $this->hasMany(ProjectSetting::class);
    }

    public function isArchived(): bool
    {
        return $this->archived_at !== null;
    }

    public function hasMember(Admin $admin): bool
    {
        return $this->members()->whereKey($admin->getKey())->exists();
    }

    /** @return list<string> */
    public function enabledServices(): array
    {
        return array_values(array_map('strval', $this->services()->where('enabled', true)->pluck('service')->all()));
    }

    protected static function newFactory(): ProjectFactory
    {
        return ProjectFactory::new();
    }
}
