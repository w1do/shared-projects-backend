<?php

declare(strict_types=1);

namespace Cms\Analytics\Console;

use Cms\Analytics\Infrastructure\Persistence\EventBuffer;
use Illuminate\Console\Command;

final class ReplayCommand extends Command
{
    protected $signature = 'analytics:replay';

    protected $description = 'Move dead-letter events back into the buffer';

    public function handle(EventBuffer $buffer): int
    {
        $count = $buffer->replay();
        $this->info("Replayed {$count} events.");

        return self::SUCCESS;
    }
}
