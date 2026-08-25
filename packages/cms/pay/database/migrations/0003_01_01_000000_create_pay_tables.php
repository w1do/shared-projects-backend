<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Тарифные планы
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('code', 64);
            $table->string('name');
            $table->unsignedBigInteger('price_minor'); // деньги — только минорные единицы
            $table->string('currency', 3)->default('RUB');
            $table->string('interval', 16)->default('month'); // month | year | day
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->unique(['project_id', 'code']);
        });

        // Опции плана: лимиты и значения
        Schema::create('plan_options', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();
            $table->string('key', 64);
            $table->string('value');
            $table->timestamps();
            $table->unique(['plan_id', 'key']);
        });

        // Возможности (features)
        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('code', 64);
            $table->string('name');
            $table->timestamps();
            $table->unique(['project_id', 'code']);
        });

        Schema::create('feature_plan', function (Blueprint $table) {
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();
            $table->foreignId('feature_id')->constrained()->cascadeOnDelete();
            $table->primary(['plan_id', 'feature_id']);
        });

        // Единоразовые платежи
        Schema::create('payments', function (Blueprint $table) {
            $table->string('id', 64)->primary(); // ulid
            $table->string('project_id', 64)->index();
            $table->string('user_key', 128)->index(); // субъект: user:{project}:{id}
            $table->unsignedBigInteger('amount_minor');
            $table->unsignedBigInteger('refunded_minor')->default(0);
            $table->string('currency', 3);
            $table->string('status', 20)->default('created');
            $table->string('provider', 32)->default('manual');
            $table->string('provider_ref')->nullable()->index();
            $table->string('description')->nullable();
            $table->string('idempotency_key', 128)->nullable();
            $table->string('subscription_id', 64)->nullable()->index();
            $table->timestamps();
            $table->unique(['project_id', 'idempotency_key']);
        });

        // Append-only леджер
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('payment_id', 64)->index();
            $table->string('type', 16); // charge | refund
            $table->bigInteger('amount_minor'); // refund — отрицательный
            $table->string('currency', 3);
            $table->timestamp('created_at')->useCurrent();
        });

        // Подписки
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->string('id', 64)->primary(); // ulid
            $table->string('project_id', 64)->index();
            $table->string('user_key', 128)->index();
            $table->foreignId('plan_id')->constrained();
            $table->string('status', 16)->default('active');
            $table->timestamp('current_period_ends_at');
            $table->timestamp('paused_at')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->unsignedTinyInteger('renewal_attempts')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });

        // Сырые вебхуки провайдеров: идемпотентность по (provider, external_id)
        Schema::create('payment_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 32);
            $table->string('external_id', 128);
            $table->json('payload');
            $table->string('status', 16)->default('received'); // received | processed | failed
            $table->timestamps();
            $table->unique(['provider', 'external_id']);
        });

        // Конфиг провайдера на проект (секреты зашифрованы)
        Schema::create('provider_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('provider', 32);
            $table->text('credentials')->nullable(); // encrypted json
            $table->boolean('enabled')->default(true);
            $table->timestamps();
            $table->unique(['project_id', 'provider']);
        });
    }

    public function down(): void
    {
        foreach (['provider_accounts', 'payment_webhook_events', 'subscriptions', 'payment_transactions', 'payments', 'feature_plan', 'features', 'plan_options', 'plans'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
