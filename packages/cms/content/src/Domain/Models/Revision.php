<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Models;

use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $project_id
 * @property string $revisable_type
 * @property int $revisable_id
 * @property array<string, mixed> $snapshot
 * @property ?string $author_id
 * @property ?Carbon $created_at
 */
class Revision extends Model
{
    use BelongsToProject;

    public $timestamps = false;

    protected $fillable = ['project_id', 'snapshot', 'author_id', 'created_at'];

    protected function casts(): array
    {
        return ['snapshot' => 'array', 'created_at' => 'datetime'];
    }

    public function revisable(): MorphTo
    {
        return $this->morphTo();
    }
}
