<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Д1 (provider-settings-platega): provider_accounts становится универсальной
 * моделью настроек провайдеров — группа/подписи, произвольные properties,
 * URL-ы возврата и статус жизненного цикла. `enabled` заменяется на `status`
 * (active|archived): два источника истины держать нельзя.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('provider_accounts', function (Blueprint $table) {
            $table->string('group', 32)->default('payments');
            $table->string('label')->nullable();
            $table->string('name')->nullable();
            $table->jsonb('properties')->nullable();
            $table->string('return_url')->nullable();
            $table->string('fail_url')->nullable();
            $table->string('status', 16)->default('active');
        });

        // Бэкфилл статуса из enabled: выключенный аккаунт = архивный
        DB::table('provider_accounts')->where('enabled', false)->update(['status' => 'archived']);

        Schema::table('provider_accounts', function (Blueprint $table) {
            $table->dropColumn('enabled');
        });
    }

    public function down(): void
    {
        Schema::table('provider_accounts', function (Blueprint $table) {
            $table->boolean('enabled')->default(true);
        });

        DB::table('provider_accounts')->where('status', 'archived')->update(['enabled' => false]);

        // По одной колонке на вызов: sqlite ограничивает пакетный DROP COLUMN
        foreach (['status', 'fail_url', 'return_url', 'properties', 'name', 'label', 'group'] as $column) {
            Schema::table('provider_accounts', function (Blueprint $table) use ($column) {
                $table->dropColumn($column);
            });
        }
    }
};
