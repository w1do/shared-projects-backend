<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Models;

use Cms\Pay\Database\Factories\PaymentFactory;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Shared\Tenant\BelongsToProject;
use Cms\Shared\Values\Money;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $project_id
 * @property string $subject_key
 * @property int $amount_minor
 * @property int $refunded_minor
 * @property string $currency
 * @property PaymentStatus $status
 * @property string $provider
 * @property ?string $provider_ref
 * @property ?string $redirect_url
 * @property ?string $description
 * @property ?string $idempotency_key
 * @property ?string $subscription_id
 * @property ?Carbon $created_at
 * @property-read ?Subscription $subscription
 */
class Payment extends Model
{
    use BelongsToProject;
    use HasFactory;
    use HasUlids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'project_id', 'subject_key', 'amount_minor', 'currency', 'status',
        'provider', 'provider_ref', 'description', 'idempotency_key', 'subscription_id',
    ];

    protected $attributes = ['status' => 'created', 'refunded_minor' => 0];

    protected function casts(): array
    {
        return [
            'status' => PaymentStatus::class,
            'amount_minor' => 'int',
            'refunded_minor' => 'int',
        ];
    }

    /** @return HasMany<PaymentTransaction, $this> */
    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    /** @return BelongsTo<Subscription, $this> */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Сумма платежа строгим Money. Валюта в БД всегда в верхнем регистре
     * (нормализация на записи + бэкфилл, Д11) — VO Currency это гарантирует.
     */
    public function amount(): Money
    {
        return Money::of($this->amount_minor, $this->currency);
    }

    public function refundableMinor(): int
    {
        return $this->amount_minor - $this->refunded_minor;
    }

    /** Остаток, доступный к возврату. */
    public function refundable(): Money
    {
        return Money::of($this->refundableMinor(), $this->currency);
    }

    protected static function newFactory(): PaymentFactory
    {
        return PaymentFactory::new();
    }
}
