<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * SEO принадлежит паре «проект + сущность». Прежний ключ этого не учитывал:
     * посты и страницы сами принадлежат проекту, а справочный город — общий,
     * и два проекта не смогли бы описать один город по-разному.
     */
    public function up(): void
    {
        Schema::table('seo_meta', function (Blueprint $table) {
            $table->dropUnique(['seoable_type', 'seoable_id']);
            $table->unique(['project_id', 'seoable_type', 'seoable_id']);
        });
    }

    public function down(): void
    {
        Schema::table('seo_meta', function (Blueprint $table) {
            $table->dropUnique(['project_id', 'seoable_type', 'seoable_id']);
            $table->unique(['seoable_type', 'seoable_id']);
        });
    }
};
