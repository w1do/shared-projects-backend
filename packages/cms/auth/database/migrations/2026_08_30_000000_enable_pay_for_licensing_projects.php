<?php

declare(strict_types=1);

use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Enums\ServiceName;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Лицензирование переехало под тумблер оплаты: проекты, где `licensing`
 * включил оператор, получают включённый `pay`, иначе их разделы пропали бы
 * из консоли.
 *
 * Признак «включил оператор» — запись аудита о включении сервиса: бэкфилл
 * от 28.08 проставил `licensing` всем проектам и аудит намеренно не писал,
 * поэтому по одному только `enabled` оплата включилась бы везде.
 *
 * Строки `licensing` не удаляются: реестр их больше не читает, а откат кода
 * возвращает прежнюю видимость без правки данных.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        $projects = DB::table('project_services')
            ->where('service', ServiceName::Licensing->value)
            ->where('enabled', true)
            ->whereExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('audit_logs')
                    ->whereColumn('audit_logs.project_id', 'project_services.project_id')
                    ->where('audit_logs.action', AuditAction::ServiceEnabled->value)
                    ->where('audit_logs.subject', 'service:'.ServiceName::Licensing->value);
            })
            ->pluck('project_id');

        foreach ($projects as $projectId) {
            $pay = DB::table('project_services')
                ->where('project_id', $projectId)
                ->where('service', ServiceName::Pay->value);

            if ($pay->exists()) {
                $pay->where('enabled', false)->update([
                    'enabled' => true,
                    'enabled_at' => $now,
                    'updated_at' => $now,
                ]);

                continue;
            }

            DB::table('project_services')->insert([
                'project_id' => $projectId,
                'service' => ServiceName::Pay->value,
                'enabled' => true,
                'enabled_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        // Выключать оплату вслепую нельзя: она могла быть включена и до миграции.
    }
};
