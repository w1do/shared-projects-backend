<?php

declare(strict_types=1);

namespace Cms\Content\Console;

use Cms\Content\Application\Commands\SyncCitiesCommand;
use Cms\Content\Application\Handlers\SyncCitiesHandler;
use Illuminate\Console\Command;

/** Наполнение и обновление справочника городов (вызывается на деплое). */
final class CitySyncCommand extends Command
{
    protected $signature = 'city:sync {source? : путь к файлу или адрес; по умолчанию — поставляемая копия}';

    protected $description = 'Sync the regions and cities directory from the source dataset';

    public function handle(SyncCitiesHandler $handler): int
    {
        $source = $this->argument('source');
        $summary = $handler->handle(new SyncCitiesCommand(is_string($source) ? $source : null));

        $this->info("Регионы: добавлено {$summary->regions_added}, обновлено {$summary->regions_updated}.");
        $this->info("Города: добавлено {$summary->cities_added}, обновлено {$summary->cities_updated}.");

        $missing = count($summary->missing);
        $missing === 0
            ? $this->info('Расхождений с источником нет.')
            : $this->warn("Нет в источнике ({$missing}): ".implode(', ', array_slice($summary->missing, 0, 20)).($missing > 20 ? '…' : ''));

        return self::SUCCESS;
    }
}
