<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Models;

use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;

class ProviderAccount extends Model
{
    use BelongsToProject;

    protected $fillable = ['project_id', 'provider', 'credentials', 'enabled'];

    protected function casts(): array
    {
        return ['credentials' => 'encrypted:array', 'enabled' => 'bool'];
    }
}
