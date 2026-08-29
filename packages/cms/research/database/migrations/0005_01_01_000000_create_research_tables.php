<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('researches', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('query');
            $table->string('offer', 2000)->nullable();
            $table->string('engine', 16);
            $table->unsignedTinyInteger('sub_queries_count');
            $table->unsignedTinyInteger('results_per_sub_query');
            $table->string('status', 16)->default('process');
            $table->string('progress_stage', 16)->default('starting');
            $table->json('sub_queries')->nullable();
            $table->longText('summary')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('indexed_at')->nullable();
            $table->string('author_id', 64)->nullable();
            $table->timestamps();

            $table->index(['project_id', 'status', 'created_at']);
        });

        // Источники хранятся построчно, а не json-массивом: они нужны для показа
        // в консоли, для записи в базу знаний и для отметки об индексации.
        Schema::create('research_sources', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->foreignId('research_id')->constrained('researches')->cascadeOnDelete();
            $table->string('sub_query')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->text('url');
            // Хэш адреса, а не сам адрес: btree-индекс по text ограничен длиной,
            // а уникальность источника в пределах исследования нужна как гарантия —
            // повторная доставка задачи не должна создавать вторую копию страницы.
            $table->char('url_hash', 64);
            $table->string('title')->nullable();
            $table->longText('content');
            $table->timestamp('indexed_at')->nullable();
            $table->timestamps();

            $table->unique(['research_id', 'url_hash']);
            $table->index(['research_id', 'position']);
            $table->index(['project_id', 'indexed_at']);
        });

        Schema::create('research_topics', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->foreignId('research_id')->constrained('researches')->cascadeOnDelete();
            $table->string('title');
            $table->text('rationale')->nullable();
            $table->unsignedBigInteger('category_id')->nullable()->index();
            $table->string('suggested_category')->nullable();
            $table->string('status', 16)->default('suggested');
            $table->unsignedBigInteger('post_id')->nullable()->index();
            $table->timestamps();

            // Повторное извлечение тем не плодит дубликаты
            $table->unique(['research_id', 'title']);
            $table->index(['project_id', 'status']);
        });

        Schema::create('project_buildouts', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('topic');
            $table->string('status', 16)->default('process');
            $table->boolean('overwrite')->default(false);
            $table->unsignedSmallInteger('categories_created')->default(0);
            $table->boolean('project_updated')->default(false);
            $table->text('error_message')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('author_id', 64)->nullable();
            $table->timestamps();

            $table->index(['project_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_buildouts');
        Schema::dropIfExists('research_topics');
        Schema::dropIfExists('research_sources');
        Schema::dropIfExists('researches');
    }
};
