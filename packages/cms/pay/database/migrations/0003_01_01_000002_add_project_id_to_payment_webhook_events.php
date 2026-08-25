<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * 7.9-A (Д4): тенант-колонка у `payment_webhook_events`. Nullable сознательно:
 * приём вебхука идёт без контекста проекта, а проект определяется по платежу
 * из payload — у нерезолвируемого события `project_id` остаётся NULL.
 * Глобальный `BelongsToProject`-скоуп на модель НЕ вешается (см. WebhookEvent).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_webhook_events', function (Blueprint $table) {
            $table->string('project_id', 64)->nullable()->index();
        });

        // Бэкфилл из платежей по payload->payment_id. PHP-цикл вместо
        // json-extraction в SQL: синтаксис pgsql (`payload->>'payment_id'`)
        // и sqlite различается, а объёмы таблицы малы.
        DB::table('payment_webhook_events')->whereNull('project_id')->orderBy('id')
            ->chunkById(200, function ($events): void {
                foreach ($events as $event) {
                    $payload = json_decode((string) $event->payload, true);
                    $paymentId = is_array($payload) ? ($payload['payment_id'] ?? null) : null;
                    if (! is_string($paymentId)) {
                        continue;
                    }

                    $projectId = DB::table('payments')->where('id', $paymentId)->value('project_id');
                    if ($projectId !== null) {
                        DB::table('payment_webhook_events')->where('id', $event->id)->update(['project_id' => $projectId]);
                    }
                }
            });
    }

    public function down(): void
    {
        // Индекс снимается до колонки: sqlite не умеет DROP COLUMN под живым индексом
        Schema::table('payment_webhook_events', function (Blueprint $table) {
            $table->dropIndex(['project_id']);
        });
        Schema::table('payment_webhook_events', function (Blueprint $table) {
            $table->dropColumn('project_id');
        });
    }
};
