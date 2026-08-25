<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Операторы платформы — глобальная таблица, guard admin
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('locale', 10)->default('ru');
            $table->rememberToken();
            $table->timestamps();
        });

        // Пользователи сайтов проектов — guard web, уникальность email в пределах проекта
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('name')->nullable();
            $table->string('email');
            $table->string('password');
            $table->timestamp('blocked_at')->nullable();
            $table->timestamps();
            $table->unique(['project_id', 'email']);
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email');
            $table->string('guard', 16)->default('admin');
            $table->string('project_id', 64)->nullable();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
            $table->primary(['email', 'guard']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('admins');
    }
};
