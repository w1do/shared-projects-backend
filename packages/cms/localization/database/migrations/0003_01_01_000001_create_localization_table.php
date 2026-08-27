<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('localization', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('service', 32);
            $table->string('key');
            $table->string('locale', 12);
            // value — переопределение админа; default_value синхронизируется из кода
            $table->text('value')->nullable();
            $table->text('default_value');
            $table->timestamps();
            $table->unique(['project_id', 'service', 'key', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('localization');
    }
};
