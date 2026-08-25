<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Jobs;

use Cms\Analytics\Application\Queries\OverviewQuery;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Storage;

/**
 * Экспорт отчёта — всегда асинхронно; готовый файл выдаётся позже.
 *
 * Зависимости приходят методной инъекцией контейнера в `handle()`: конструкторная
 * инъекция для очередной задачи невозможна — аргументы конструктора сериализуются
 * в payload очереди. `ProjectAwareJob` здесь не наследуется по той же причине:
 * его `handle()` объявлен `final` и потому закрывает инъекцию в `execute()`;
 * контекст проекта выставляется и снимается тем же способом, что и в базовом классе,
 * а параметры повторных попыток скопированы из него дословно.
 */
final class ExportReportJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;

    public int $tries = 5;

    public int $timeout = 300;

    /** @var list<int> */
    public array $backoff = [5, 30, 120, 600];

    public function __construct(
        public readonly string $projectId,
        public readonly string $from,
        public readonly string $to,
    ) {}

    public function handle(OverviewQuery $query, ProjectContext $context): void
    {
        $context->set($this->projectId);

        try {
            $rows = $query->handle($this->projectId, $this->from, $this->to);

            $csv = "date,name,events,sessions,subjects\n";
            foreach ($rows as $row) {
                $csv .= sprintf("%s,%s,%d,%d,%d\n", $row->date, $row->name, $row->events, $row->sessions, $row->subjects);
            }

            Storage::disk('local')->put("exports/{$this->projectId}/overview_{$this->from}_{$this->to}.csv", $csv);
        } finally {
            $context->clear();
        }
    }
}
