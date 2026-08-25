<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Persistence;

use Cms\Auth\Domain\Enums\ActorType;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Enums\Guard;
use Cms\Auth\Domain\Models\AuditLog;
use Cms\Shared\Http\TraceId;
use Illuminate\Contracts\Auth\Factory as AuthFactory;

/**
 * Запись в журнал аудита. Молчаливых изменений тенант-данных не бывает.
 *
 * Запись синхронная и остаётся такой (инвариант И9): аудит — часть операции,
 * а не уведомление о ней; потеря записи из-за упавшего воркера означала бы
 * успешный ответ 200 без следа в журнале.
 *
 * Раньше это был статический вызов, дотягивавшийся до контейнера за `TraceId`
 * и до guard'а за идентификатором оператора; теперь обе зависимости — явные.
 */
final class AuditRecorder
{
    public function __construct(
        private readonly TraceId $traceId,
        private readonly AuthFactory $auth,
    ) {}

    /** @param  array<string, mixed>  $changes */
    public function record(
        AuditAction $action,
        ?string $projectId = null,
        ?string $subject = null,
        array $changes = [],
        ActorType $actorType = ActorType::Admin,
        ?string $actorId = null,
    ): void {
        AuditLog::create([
            'project_id' => $projectId,
            'actor_type' => $actorType->value,
            'actor_id' => $actorId ?? (string) $this->auth->guard(Guard::Admin->value)->id(),
            'action' => $action->value,
            'subject' => $subject,
            'changes' => $changes ?: null,
            'trace_id' => $this->traceId->current(),
            'created_at' => now(),
        ]);
    }
}
