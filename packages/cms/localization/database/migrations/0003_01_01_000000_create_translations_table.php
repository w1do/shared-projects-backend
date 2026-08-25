<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('key');
            // key -> {locale: value}; machine помечает автопереводы: {locale: true}
            $table->jsonb('values')->default('{}');
            $table->jsonb('machine')->default('{}');
            $table->timestamps();
            $table->unique(['project_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
