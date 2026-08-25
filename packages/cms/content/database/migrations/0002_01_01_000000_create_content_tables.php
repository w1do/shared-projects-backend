<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Категории — nested sets (kalnoy/nestedset): _lft/_rgt + parent_id
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('name');
            $table->string('slug');
            $table->unsignedInteger('_lft')->default(0);
            $table->unsignedInteger('_rgt')->default(0);
            $table->unsignedBigInteger('parent_id')->nullable()->index();
            $table->boolean('is_index')->default(true);
            $table->timestamps();
            $table->unique(['project_id', 'slug']);
            $table->index(['project_id', '_lft', '_rgt']);
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('title');
            $table->string('slug');
            $table->longText('body')->nullable();
            $table->string('locale', 10)->default('ru');
            $table->string('translation_group', 64)->nullable()->index();
            $table->string('status', 16)->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_index')->default(true);
            $table->string('author_id', 64)->nullable();
            $table->timestamps();
            $table->unique(['project_id', 'slug', 'locale']);
            $table->index(['project_id', 'status', 'published_at']);
        });

        Schema::create('category_post', function (Blueprint $table) {
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->primary(['post_id', 'category_id']);
        });

        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('title');
            $table->string('slug');
            $table->longText('body')->nullable();
            $table->string('locale', 10)->default('ru');
            $table->string('status', 16)->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_index')->default(true);
            $table->timestamps();
            $table->unique(['project_id', 'slug']);
        });

        // Ревизии постов и страниц (полиморфно)
        Schema::create('revisions', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->morphs('revisable');
            $table->json('snapshot');
            $table->string('author_id', 64)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // Полиморфное SEO: пост / страница / категория
        Schema::create('seo_meta', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->morphs('seoable');
            $table->string('title')->nullable();
            $table->string('description', 500)->nullable();
            $table->string('keywords', 500)->nullable();
            $table->string('canonical')->nullable();
            $table->string('robots', 64)->nullable(); // например "noindex,nofollow"
            $table->string('og_title')->nullable();
            $table->string('og_description', 500)->nullable();
            $table->string('og_image')->nullable();
            $table->string('twitter_card', 32)->nullable();
            $table->json('json_ld')->nullable();
            $table->timestamps();
            $table->unique(['seoable_type', 'seoable_id']);
        });

        // Медиа проекта (S3/MinIO)
        Schema::create('media_files', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('disk', 32)->default('s3');
            $table->string('path');
            $table->string('mime', 128);
            $table->unsignedBigInteger('size');
            $table->string('alt')->nullable();
            $table->json('variants')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['media_files', 'seo_meta', 'revisions', 'pages', 'category_post', 'posts', 'categories'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
