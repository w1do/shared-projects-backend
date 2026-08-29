<?php

declare(strict_types=1);

namespace Cms\Instructs\Console;

use Cms\Instructs\Infrastructure\Persistence\SystemInstructSeeder;
use Illuminate\Console\Command;

/** Раскладка предустановленных инструкций платформы (вызывается на деплое). */
final class SeedSystemInstructsCommand extends Command
{
    protected $signature = 'instructs:seed-system';

    protected $description = 'Seed the platform system instructs';

    public function handle(SystemInstructSeeder $seeder): int
    {
        $this->info("System instructs seeded: {$seeder->seed()}.");

        return self::SUCCESS;
    }
}
