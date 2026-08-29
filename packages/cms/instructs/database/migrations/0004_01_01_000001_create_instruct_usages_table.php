<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Снимок неизменяем: правка и удаление инструкции не переписывают историю,
        // поэтому связь с instructs — без каскадного удаления.
        Schema::create('instruct_usages', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->unsignedBigInteger('instruct_id')->index();
            $table->nullableMorphs('generated');
            $table->string('title_snapshot', 120);
            $table->string('category_snapshot', 60);
            $table->text('rule_snapshot');
            $table->json('schema_snapshot');
            $table->timestamps();

            $table->index(['project_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instruct_usages');
    }
};
