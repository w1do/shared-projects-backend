<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false);
        });

        // Частичный уникальный индекс: «в проекте один закреплённый пост» —
        // инвариант базы, а не договорённость обработчика.
        DB::statement('CREATE UNIQUE INDEX posts_featured_unique ON posts (project_id) WHERE is_featured');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX posts_featured_unique');

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('is_featured');
        });
    }
};
