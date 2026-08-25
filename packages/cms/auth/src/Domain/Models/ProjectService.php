<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property string $project_id
 * @property string $service
 * @property bool $enabled
 */
class ProjectService extends Model
{
    protected $fillable = ['project_id', 'service', 'enabled', 'enabled_at'];

    protected function casts(): array
    {
        return ['enabled' => 'bool', 'enabled_at' => 'datetime'];
    }
}
