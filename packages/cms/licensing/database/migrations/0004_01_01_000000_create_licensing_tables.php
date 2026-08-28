<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Таблицы модуля лицензирования (Д2): префиксы licensing_/license_ исключают
 * конфликт с plans/features биллинга в той же БД pay-service.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Анкеты организаций-покупателей
        Schema::create('licensing_organizations', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('name');
            $table->string('contact_first_name');
            $table->string('contact_last_name');
            $table->string('phone', 32)->nullable();
            $table->string('email');
            $table->string('telegram', 64)->nullable();
            $table->string('activity')->nullable();
            $table->unsignedInteger('employees_count')->nullable();
            $table->string('usage_purpose', 512)->nullable();
            $table->timestamps();
        });

        // Планы поставки: цена периода опциональна — тройка целиком или ничего
        Schema::create('license_plans', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('code', 64);
            $table->string('name');
            $table->unsignedBigInteger('price_minor')->nullable();
            $table->string('currency', 3)->nullable();
            $table->string('interval', 16)->nullable(); // month | year | day
            $table->timestamps();
            $table->unique(['project_id', 'code']);
        });

        // Фичи плана; organization_id NULL — базовая, иначе переопределение (Д4)
        Schema::create('license_plan_features', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->foreignId('plan_id')->constrained('license_plans')->cascadeOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained('licensing_organizations')->cascadeOnDelete();
            $table->string('code', 64);
            $table->string('name');
            $table->timestamps();
            $table->unique(['plan_id', 'organization_id', 'code']);
        });

        // Лицензии: uuid PK входит в подписанный payload (Д8)
        Schema::create('licenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('project_id', 64)->index();
            $table->foreignId('organization_id')->constrained('licensing_organizations');
            $table->foreignId('plan_id')->constrained('license_plans');
            $table->string('key', 64)->unique(); // LIC-XXXXX-…, глобально уникален
            $table->text('signed_payload');
            $table->timestamp('issued_at');
            $table->timestamp('expires_at');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });

        // Ed25519-пара проекта: приватный ключ шифруется Crypt (Д3)
        Schema::create('license_signing_keys', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->unique();
            $table->text('public_key');
            $table->text('secret_key');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['license_signing_keys', 'licenses', 'license_plan_features', 'license_plans', 'licensing_organizations'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
