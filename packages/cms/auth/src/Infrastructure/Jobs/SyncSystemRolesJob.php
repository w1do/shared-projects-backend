<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Jobs;

use Cms\Auth\Domain\Enums\ActorType;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;
use Cms\Auth\Infrastructure\Persistence\SystemRoleSyncer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Пере-раскрытие системных ролей по ВСЕМ проектам после публикации манифеста.
 *
 * Раньше этот цикл выполнялся внутри `POST /internal/manifests`: время ответа
 * росло линейно по числу проектов. Работа не относится к результату запроса —
 * сервису важно, что манифест зарегистрирован, — поэтому уходит в очередь.
 *
 * Кэш bootstrap сбрасывается здесь ещё раз, уже после раскрытия ролей: иначе
 * при асинхронной обработке панель успела бы прогреть кэш старым набором прав.
 */
final class SyncSystemRolesJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function handle(SystemRoleSyncer $syncer): void
    {
        Project::query()->each(fn (Project $project) => $syncer->sync($project));

        BootstrapCache::bump();
    }

    /** Провал пере-раскрытия ролей — след в аудите (канон Jobs: failed() → audit). */
    public function failed(?\Throwable $exception): void
    {
        app(AuditRecorder::class)->record(
            action: AuditAction::RolesSyncFailed,
            changes: ['error' => $exception?->getMessage() ?? 'unknown'],
            actorType: ActorType::System,
            actorId: 'system',
        );
    }
}
