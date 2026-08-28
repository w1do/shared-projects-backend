<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Perpetual-модель лицензирования (Д1/Д2): v1-таблица licenses дропается без
 * переноса данных (поставок нет), создаются licenses новой схемы, учёт
 * установок и каталог релизов. organizations/plans/signing_keys не меняются.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('licenses');

        Schema::create('licenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('project_id', 64)->index();
            $table->foreignId('organization_id')->constrained('licensing_organizations');
            $table->foreignId('plan_id')->constrained('license_plans');
            $table->char('key_hash', 64)->unique(); // глобально: резолв проекта по ключу
            $table->string('key_prefix', 16);
            $table->text('key_encrypted')->nullable(); // авто-выпуск: шифрованная копия до первого показа (Д8)
            $table->string('edition', 32);
            $table->json('features');
            $table->string('entitled_version', 20)->nullable();
            $table->date('updates_until');
            $table->unsignedSmallInteger('max_installations')->default(1);
            $table->text('note')->nullable();
            $table->timestamp('issued_at');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('license_installations', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('license_id')->constrained('licenses')->cascadeOnDelete();
            $table->char('install_id', 64);
            $table->string('domain');
            $table->string('app_version', 20)->nullable();
            $table->string('last_ip', 45)->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
            $table->unique(['license_id', 'install_id']);
        });

        Schema::create('releases', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('version', 20);
            $table->string('train', 10);
            $table->string('repository');
            $table->timestamp('released_at');
            $table->boolean('is_security')->default(false);
            $table->string('min_upgrade_from', 20)->nullable();
            $table->string('changelog_url')->nullable();
            $table->timestamps();
            $table->unique(['project_id', 'version']);
        });
    }

    public function down(): void
    {
        foreach (['releases', 'license_installations', 'licenses'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
