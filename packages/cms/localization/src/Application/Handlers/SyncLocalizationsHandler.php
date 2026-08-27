<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Handlers;

use Cms\Localization\Application\Commands\SyncLocalizationsCommand;
use Cms\Localization\Application\DTOs\Localization\SyncReportDTO;
use Cms\Localization\Domain\Contracts\LocalizePort;
use Cms\Localization\Domain\Models\Localization;
use Cms\Localization\Domain\Models\Translation;

/**
 * Идемпотентная синхронизация реестра с таблицей `localization`:
 * недостающие строки вставляются пакетно, изменённые `default_value`
 * обновляются, переопределения админа (`value`) не трогаются.
 */
final class SyncLocalizationsHandler
{
    public function __construct(private readonly LocalizePort $registry) {}

    public function handle(SyncLocalizationsCommand $command): SyncReportDTO
    {
        $projects = $command->projectIds !== [] ? $command->projectIds : $this->knownProjects();
        $entries = $this->registry->all();

        $added = 0;
        $updated = 0;
        $unchanged = 0;

        foreach ($projects as $projectId) {
            $existing = Localization::acrossProjects()
                ->where('project_id', $projectId)
                ->get()
                ->keyBy(fn (Localization $row): string => "{$row->service}|{$row->key}|{$row->locale}");

            $missing = [];

            foreach ($entries as $entry) {
                $row = $existing->get("{$entry->service}|{$entry->key}|{$entry->locale}");

                if ($row === null) {
                    $missing[] = [
                        'project_id' => $projectId,
                        'service' => $entry->service,
                        'key' => $entry->key,
                        'locale' => $entry->locale,
                        'default_value' => $entry->value,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    $added++;
                } elseif ($row->default_value !== $entry->value) {
                    $row->default_value = $entry->value;
                    $row->save();
                    $updated++;
                } else {
                    $unchanged++;
                }
            }

            if ($missing !== []) {
                Localization::acrossProjects()->insert($missing);
            }
        }

        return new SyncReportDTO(added: $added, updated: $updated, unchanged: $unchanged, projects: count($projects));
    }

    /**
     * Проекты, известные content-service: реестра проектов здесь нет
     * (он в auth), поэтому берутся все project_id из локальных таблиц.
     *
     * @return list<string>
     */
    private function knownProjects(): array
    {
        $projectIds = Translation::acrossProjects()->select('project_id')->distinct()->pluck('project_id')
            ->merge(Localization::acrossProjects()->select('project_id')->distinct()->pluck('project_id'))
            ->map(fn (mixed $projectId): string => (string) $projectId)
            ->unique()
            ->sort()
            ->all();

        return array_values($projectIds);
    }
}
