<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Обложка и баннер — по одному медиа проекта; удаление медиа оставляет пост без изображения
        Schema::table('posts', function (Blueprint $table) {
            $table->foreignId('cover_media_id')->nullable()->constrained('media_files')->nullOnDelete();
            $table->foreignId('banner_media_id')->nullable()->constrained('media_files')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cover_media_id');
            $table->dropConstrainedForeignId('banner_media_id');
        });
    }
};
