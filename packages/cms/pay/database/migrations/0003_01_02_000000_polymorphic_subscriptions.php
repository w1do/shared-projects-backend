<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Полиморфные подписки (Д10/Д11/Д13): подписчик и предмет — пары type+id
 * вместо строки `user_key` и FK `plan_id`; `payments.user_key` переименовывается
 * в `subject_key` (денормализованный субъект-ключ аналитики).
 *
 * Бэкфилл — PHP-чанками через query builder: работает и на Postgres (прод),
 * и на sqlite :memory: (тестовый контур), никакого драйвер-специфичного SQL.
 * Откат восстанавливает `user_key`/`plan_id` конкатенацией/парсингом; подписки
 * с не-site подписчиками откату не подлежат (см. design.md, Migration Plan).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('subscriber_type', 32)->nullable();
            $table->string('subscriber_id', 64)->nullable();
            $table->string('subject_type', 32)->nullable();
            $table->string('subject_id', 64)->nullable();
        });

        // user:{project}:{id} → (site_user, {id}); plan_id → (plan, {id})
        DB::table('subscriptions')->orderBy('id')->chunkById(500, function ($subscriptions) {
            foreach ($subscriptions as $subscription) {
                DB::table('subscriptions')->where('id', $subscription->id)->update([
                    'subscriber_type' => 'site_user',
                    'subscriber_id' => explode(':', $subscription->user_key, 3)[2] ?? $subscription->user_key,
                    'subject_type' => 'plan',
                    'subject_id' => (string) $subscription->plan_id,
                ]);
            }
        }, 'id');

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('subscriber_type', 32)->nullable(false)->change();
            $table->string('subscriber_id', 64)->nullable(false)->change();
            $table->string('subject_type', 32)->nullable(false)->change();
            $table->string('subject_id', 64)->nullable(false)->change();
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropForeign(['plan_id']);
            $table->dropIndex(['user_key']);
            $table->dropColumn(['user_key', 'plan_id']);
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            // имена явные: автогенерируемые превышают лимит идентификатора Postgres
            $table->index(
                ['subscriber_type', 'subscriber_id', 'subject_type', 'subject_id'],
                'subscriptions_subscriber_subject_index'
            );
            $table->index(['subject_type', 'subject_id'], 'subscriptions_subject_index');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['user_key']);
            $table->renameColumn('user_key', 'subject_key');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index('subject_key');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['subject_key']);
            $table->renameColumn('subject_key', 'user_key');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index('user_key');
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('user_key', 128)->nullable();
            $table->unsignedBigInteger('plan_id')->nullable();
        });

        DB::table('subscriptions')->orderBy('id')->chunkById(500, function ($subscriptions) {
            foreach ($subscriptions as $subscription) {
                $segment = $subscription->subscriber_type === 'site_user' ? 'user' : $subscription->subscriber_type;
                DB::table('subscriptions')->where('id', $subscription->id)->update([
                    'user_key' => "{$segment}:{$subscription->project_id}:{$subscription->subscriber_id}",
                    'plan_id' => $subscription->subject_type === 'plan' ? (int) $subscription->subject_id : null,
                ]);
            }
        }, 'id');

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex('subscriptions_subscriber_subject_index');
            $table->dropIndex('subscriptions_subject_index');
            $table->dropColumn(['subscriber_type', 'subscriber_id', 'subject_type', 'subject_id']);
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('user_key', 128)->nullable(false)->change();
            $table->unsignedBigInteger('plan_id')->nullable(false)->change();
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->index('user_key');
            $table->foreign('plan_id')->references('id')->on('plans');
        });
    }
};
