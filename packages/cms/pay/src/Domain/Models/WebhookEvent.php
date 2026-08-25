<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $provider
 * @property string $external_id
 * @property array<string, mixed> $payload
 * @property string $status
 */
class WebhookEvent extends Model
{
    protected $table = 'payment_webhook_events';

    protected $fillable = ['provider', 'external_id', 'payload', 'status'];

    protected function casts(): array
    {
        return ['payload' => 'array'];
    }
}
