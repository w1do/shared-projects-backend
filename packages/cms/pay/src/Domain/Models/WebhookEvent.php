<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Тенант-колонка `project_id` есть, но глобального `BelongsToProject`-скоупа
 * нет сознательно (7.9-B, Д4): приём `/webhooks/{provider}` идёт без auth и
 * без `ProjectContext` — guard 0.8 мутационно доказал, что скоуп ломает приём.
 * Проект вебхука известен только через платёж из payload: `project_id`
 * заполняется при регистрации (если платёж резолвится) или при обработке
 * джобой; у нерезолвируемого события остаётся NULL. Инвариант tenant-изоляции
 * выполняется заполнением колонки, а будущие выборки по проекту обязаны
 * использовать явный `where('project_id', ...)`.
 *
 * @property int $id
 * @property ?string $project_id
 * @property string $provider
 * @property string $external_id
 * @property array<string, mixed> $payload
 * @property string $status
 */
class WebhookEvent extends Model
{
    protected $table = 'payment_webhook_events';

    protected $fillable = ['project_id', 'provider', 'external_id', 'payload', 'status'];

    protected function casts(): array
    {
        return ['payload' => 'array'];
    }
}
