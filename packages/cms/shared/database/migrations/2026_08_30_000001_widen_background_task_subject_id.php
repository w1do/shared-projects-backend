<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('background_tasks', function (Blueprint $table) {
            // Предмет импорта медиа — сама ссылка, а её длину ограничивает валидация запроса.
            $table->string('subject_id', 2048)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('background_tasks', function (Blueprint $table) {
            $table->string('subject_id', 64)->nullable()->change();
        });
    }
};
