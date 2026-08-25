<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Models;

use Cms\Pay\Domain\Enums\TransactionType;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;

/** Append-only леджер: обновлять и удалять записи запрещено. */
class PaymentTransaction extends Model
{
    use BelongsToProject;

    public $timestamps = false;

    protected $fillable = ['project_id', 'payment_id', 'type', 'amount_minor', 'currency', 'created_at'];

    protected function casts(): array
    {
        return ['type' => TransactionType::class, 'amount_minor' => 'int', 'created_at' => 'datetime'];
    }

    public static function boot(): void
    {
        parent::boot();
        static::updating(fn () => throw new \LogicException('Ledger entries are append-only.'));
        static::deleting(fn () => throw new \LogicException('Ledger entries are append-only.'));
    }
}
