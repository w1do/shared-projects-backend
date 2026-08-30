<?php

declare(strict_types=1);

namespace Cms\Auth\Console;

use Cms\Auth\Application\Commands\SyncPermissionsCommand;
use Cms\Auth\Application\Handlers\SyncPermissionsHandler;
use Illuminate\Console\Command;

/**
 * Приводит каталог прав и системные роли всех проектов к опубликованным
 * манифестам. Идемпотентна: второй запуск подряд показывает нулевые изменения.
 */
final class SyncPermissionsConsoleCommand extends Command
{
    protected $signature = 'permissions:sync {--prune : Delete permissions missing from every published manifest}';

    protected $description = 'Sync the permission catalog and system roles with the published service manifests';

    public function handle(SyncPermissionsHandler $handler): int
    {
        $summary = $handler->handle(new SyncPermissionsCommand((bool) $this->option('prune')));

        $this->table(['Metric', 'Value'], [
            ['manifests', $summary->manifests],
            ['permissions added', $summary->added],
            ['permissions updated', $summary->updated],
            ['projects', $summary->projects],
            ['roles rebuilt', $summary->roles],
            ['orphans', count($summary->orphans)],
        ]);

        if ($summary->orphans === []) {
            return self::SUCCESS;
        }

        $this->warn($summary->pruned
            ? 'Deleted permissions (missing from every manifest, detached from all roles):'
            : 'Orphan permissions (missing from every manifest, kept — run with --prune to delete):');

        foreach ($summary->orphans as $orphan) {
            $this->line("  {$orphan}");
        }

        return self::SUCCESS;
    }
}
