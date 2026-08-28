<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Д7 (provider-settings-platega): redirect-шлюзы возвращают URL платёжной
 * страницы — сохраняем его у платежа и отдаём в checkout-ответе.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('redirect_url', 1024)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('redirect_url');
        });
    }
};
