<?php

declare(strict_types=1);

namespace Cms\Shared\Jobs;

use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;

/**
 * База для джоб, работающих в контексте проекта.
 * В джобу передаётся ID проекта (не модель): глобальный scope в воркере пуст,
 * контекст восстанавливается явно в начале handle().
 */
abstract class ProjectAwareJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;

    public int $tries = 5;

    public int $timeout = 60;

    /** @var list<int> */
    public array $backoff = [5, 30, 120, 600];

    public function __construct(public readonly string $projectId) {}

    final public function handle(): void
    {
        $context = app(ProjectContext::class);

        // Синхронная диспетчеризация выполняет джобу внутри чужого контекста:
        // прежнее значение возвращается, иначе вложенный запуск обнулил бы
        // проект вызывающего. В воркере прежнего значения нет — контекст чистится.
        $previous = $context->id();
        $context->set($this->projectId);

        try {
            $this->execute();
        } finally {
            $previous === null ? $context->clear() : $context->set($previous);
        }
    }

    abstract protected function execute(): void;
}
