<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->string('id', 64)->primary(); // ulid
            $table->string('key', 64)->unique();
            $table->string('name');
            $table->json('locales')->default('["ru"]');
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
        });

        Schema::create('project_members', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->foreignId('admin_id')->constrained('admins')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['project_id', 'admin_id']);
        });

        Schema::create('project_api_keys', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('project_id', 64)->index();
            $table->string('type', 10); // public | secret
            $table->string('prefix', 16); // pk_ / sk_ + первые символы для показа
            $table->string('key_hash', 64)->unique();
            $table->json('scopes')->default('[]');
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('project_services', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('service', 32);
            $table->boolean('enabled')->default(true);
            $table->timestamp('enabled_at')->nullable();
            $table->timestamps();
            $table->unique(['project_id', 'service']);
        });

        Schema::create('project_settings', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->index();
            $table->string('service', 32);
            $table->string('key');
            $table->text('value')->nullable();       // json
            $table->boolean('secret')->default(false); // secret => value зашифрован
            $table->timestamps();
            $table->unique(['project_id', 'service', 'key']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('project_id', 64)->nullable()->index();
            $table->string('actor_type', 16); // admin | service
            $table->string('actor_id', 64)->nullable();
            $table->string('action', 64);
            $table->string('subject', 128)->nullable();
            $table->json('changes')->nullable();
            $table->string('trace_id', 64)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['project_id', 'created_at']);
        });

        Schema::create('service_manifests', function (Blueprint $table) {
            $table->string('key', 32)->primary();
            $table->string('version', 32);
            $table->json('manifest');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['service_manifests', 'audit_logs', 'project_settings', 'project_services', 'project_api_keys', 'project_members', 'projects'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
