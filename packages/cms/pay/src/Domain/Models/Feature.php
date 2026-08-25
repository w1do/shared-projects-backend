<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Models;

use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Feature extends Model
{
    use BelongsToProject;

    protected $fillable = ['project_id', 'code', 'name'];

    public function plans(): BelongsToMany
    {
        return $this->belongsToMany(Plan::class);
    }
}
