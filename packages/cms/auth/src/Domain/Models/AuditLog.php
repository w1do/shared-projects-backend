<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property ?string $project_id
 * @property string $actor_type
 * @property ?string $actor_id
 * @property string $action
 * @property ?string $subject
 * @property ?array<string, mixed> $changes
 * @property ?Carbon $created_at
 */
class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = ['project_id', 'actor_type', 'actor_id', 'action', 'subject', 'changes', 'trace_id', 'created_at'];

    protected function casts(): array
    {
        return ['changes' => 'array', 'created_at' => 'datetime'];
    }
}
