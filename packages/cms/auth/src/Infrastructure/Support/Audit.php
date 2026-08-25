<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Support;

use Cms\Auth\Domain\Models\AuditLog;
use Cms\Shared\Http\TraceId;

/** Запись в журнал аудита. Молчаливых изменений тенант-данных не бывает. */
final class Audit
{
    public static function record(
        string $action,
        ?string $projectId = null,
        ?string $subject = null,
        array $changes = [],
        string $actorType = 'admin',
        ?string $actorId = null,
    ): void {
        AuditLog::create([
            'project_id' => $projectId,
            'actor_type' => $actorType,
            'actor_id' => $actorId ?? (string) auth('admin')->id(),
            'action' => $action,
            'subject' => $subject,
            'changes' => $changes ?: null,
            'trace_id' => app(TraceId::class)->current(),
            'created_at' => now(),
        ]);
    }
}
