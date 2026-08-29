<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('background_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('kind', 32);
            $table->string('state', 16)->default('queued');
            $table->string('stage', 32)->nullable();
            // Предмет работы — тема, пост, медиафайл: тип и ключ, без внешнего ключа,
            // потому что предмет живёт в таблице своего модуля.
            $table->string('subject_type', 32)->nullable();
            $table->string('subject_id', 64)->nullable();
            $table->string('initiated_by', 64)->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('queued_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            // Выдача для консоли: выполняющиеся и недавно завершённые задачи проекта.
            $table->index(['project_id', 'state', 'created_at']);
            $table->index(['project_id', 'finished_at']);
            $table->index(['project_id', 'kind', 'subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('background_tasks');
    }
};
