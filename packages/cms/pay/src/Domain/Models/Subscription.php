<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Models;

use Cms\Pay\Database\Factories\SubscriptionFactory;
use Cms\Pay\Domain\Enums\SubscriptionStatus;
use Cms\Shared\Billing\Subscriber;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

/**
 * Подписка: полиморфный подписчик (пара subscriber_type/subscriber_id,
 * VO `Subscriber` — тип может не иметь локальной модели) на полиморфный
 * предмет (morphTo `subject`, реализует `Subscribable`).
 *
 * @property string $id
 * @property string $project_id
 * @property string $subscriber_type
 * @property string $subscriber_id
 * @property string $subject_type
 * @property string $subject_id
 * @property SubscriptionStatus $status
 * @property Carbon $current_period_ends_at
 * @property ?Carbon $paused_at
 * @property ?Carbon $canceled_at
 * @property int $renewal_attempts
 * @property-read ?Model $subject
 */
class Subscription extends Model
{
    use BelongsToProject;
    use HasFactory;
    use HasUlids;
    use SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'project_id', 'subscriber_type', 'subscriber_id',
        'subject_type', 'subject_id', 'status', 'current_period_ends_at',
    ];

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

    /** Предмет подписки: тарифный план, лицензионный план, … (морф-алиасы). */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /** Подписчик как VO: у типа может не быть локальной модели (site_user). */
    public function subscriber(): Subscriber
    {
        return new Subscriber($this->subscriber_type, $this->subscriber_id);
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

    protected static function newFactory(): SubscriptionFactory
    {
        return SubscriptionFactory::new();
    }
}
