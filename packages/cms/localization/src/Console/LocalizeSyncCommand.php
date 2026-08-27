<?php

declare(strict_types=1);

namespace Cms\Localization\Console;

use Cms\Localization\Application\Commands\SyncLocalizationsCommand;
use Cms\Localization\Application\Handlers\SyncLocalizationsHandler;
use Illuminate\Console\Command;

final class LocalizeSyncCommand extends Command
{
    protected $signature = 'localize:sync {--project=* : id проекта; без опции — все проекты, известные content-service}';

    protected $description = 'Синхронизировать зарегистрированные ключи локализации с таблицей localization';

    public function handle(SyncLocalizationsHandler $handler): int
    {
        /** @var list<string> $projects */
        $projects = array_values(array_filter((array) $this->option('project'), 'is_string'));

        $report = $handler->handle(new SyncLocalizationsCommand($projects));

        $this->info(sprintf(
            'Localizations synced: added %d, updated %d, unchanged %d (projects: %d).',
            $report->added,
            $report->updated,
            $report->unchanged,
            $report->projects,
        ));

        return self::SUCCESS;
    }
}
