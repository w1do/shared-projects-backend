<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Справочник общий на платформу: регионы и города без project_id.
        // Проектное состояние живёт в project_cities (Decision Д1).
        Schema::create('regions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('federal_district')->nullable();
            $table->timestamps();
        });

        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('region_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedInteger('population')->default(0);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamps();
            $table->unique(['region_id', 'name']);
            $table->index('population');
        });

        // Включённость города в проекте. Выключённый город остаётся строкой со
        // снятым флагом: по наличию строк видно, что стартовый набор уже применён,
        // и повторно он не накатывается (Decision Д4).
        Schema::create('project_cities', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->boolean('enabled')->default(true);
            $table->timestamps();
            $table->unique(['project_id', 'city_id']);
            $table->index(['project_id', 'enabled']);
        });
    }

    public function down(): void
    {
        foreach (['project_cities', 'cities', 'regions'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
