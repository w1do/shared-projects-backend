<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Д6 (provider-settings-platega): слепок авторизации callback для отложенной
 * верификации — проект неизвестен на приёме, hash_equals выполняется в
 * конвейере обработки. Секрет хранится только как SHA-256, не в открытую.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_webhook_events', function (Blueprint $table) {
            $table->jsonb('auth')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('payment_webhook_events', function (Blueprint $table) {
            $table->dropColumn('auth');
        });
    }
};
