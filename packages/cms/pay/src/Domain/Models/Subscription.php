<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Models;

use Cms\Pay\Domain\Enums\SubscriptionStatus;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

/**
 * @property string $id
 * @property string $project_id
 * @property string $user_key
 * @property int $plan_id
 * @property SubscriptionStatus $status
 * @property Carbon $current_period_ends_at
 * @property ?Carbon $paused_at
 * @property ?Carbon $canceled_at
 * @property int $renewal_attempts
 * @property-read ?Plan $plan
 */
class Subscription extends Model
{
    use BelongsToProject;
    use HasUlids;
    use SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['project_id', 'user_key', 'plan_id', 'status', 'current_period_ends_at'];

    protected $attributes = ['status' => 'active'];

    protected function casts(): array
    {
        return [
            'status' => SubscriptionStatus::class,
            'current_period_ends_at' => 'datetime',
            'paused_at' => 'datetime',
            'canceled_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Plan, $this> */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function transitionTo(SubscriptionStatus $target): void
    {
        if (! $this->status->canTransitionTo($target)) {
            throw ValidationException::withMessages([
                'status' => ["Transition {$this->status->value} → {$target->value} is not allowed."],
            ]);
        }
        $this->status = $target;
    }
}
