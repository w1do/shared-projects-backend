<?php

declare(strict_types=1);

use Cms\Auth\Domain\Enums\ServiceName;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Бэкфилл «licensing включён по умолчанию» для существующих проектов.
 *
 * Вставляет строку project_services(licensing, enabled=true) каждому проекту,
 * у которого строки с этим ключом ещё нет. Идемпотентна: существующие строки
 * (включая явное enabled=false) не трогаются. Audit-записи сознательно не
 * пишутся — массовое включение при релизе не является действием оператора.
 */
return new class extends Migration
{
    public function up(): void
    {
        $service = ServiceName::Licensing->value;
        $now = now();

        $missing = DB::table('projects')
            ->whereNotExists(function ($query) use ($service): void {
                $query->selectRaw('1')
                    ->from('project_services')
                    ->whereColumn('project_services.project_id', 'projects.id')
                    ->where('project_services.service', $service);
            })
            ->pluck('id');

        foreach ($missing as $projectId) {
            DB::table('project_services')->insert([
                'project_id' => $projectId,
                'service' => $service,
                'enabled' => true,
                'enabled_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        // Строки безвредны и при откате кода игнорируются реестром — не удаляем.
    }
};
