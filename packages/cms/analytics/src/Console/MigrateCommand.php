<?php

declare(strict_types=1);

namespace Cms\Analytics\Console;

use Cms\Analytics\Infrastructure\Persistence\ClickHouse\Migrator;
use Illuminate\Console\Command;

final class MigrateCommand extends Command
{
    protected $signature = 'clickhouse:migrate';

    protected $description = 'Run ClickHouse migrations (numbered .sql files)';

    public function handle(Migrator $migrator): int
    {
        $ran = $migrator->migrate(__DIR__.'/../../database/clickhouse');
        $this->info($ran === [] ? 'Nothing to migrate.' : 'Applied: '.implode(', ', $ran));

        return self::SUCCESS;
    }
}
