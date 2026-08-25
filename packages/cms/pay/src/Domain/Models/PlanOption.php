<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Models;

use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;

class PlanOption extends Model
{
    use BelongsToProject;

    protected $fillable = ['project_id', 'plan_id', 'key', 'value'];
}
