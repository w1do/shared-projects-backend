<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // project_id пуст у предустановленных инструкций платформы: они доступны
        // всем проектам на чтение и не принадлежат ни одному.
        Schema::create('instructs', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->nullable()->index();
            $table->string('title', 120);
            $table->string('category', 60);
            $table->text('rule');
            $table->json('schema');
            $table->boolean('published')->default(false);
            $table->boolean('is_system')->default(false);
            $table->string('author_id', 64)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['project_id', 'category', 'published']);
            $table->index(['is_system', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructs');
    }
};
