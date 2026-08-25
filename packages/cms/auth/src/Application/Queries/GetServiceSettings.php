<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Application\DTOs\Setting\SettingValueDTO;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectSetting;
use Illuminate\Support\Collection;

final class GetServiceSettings
{
    /** @return Collection<int, SettingValueDTO> */
    public function handle(Project $project, string $service): Collection
    {
        return ProjectSetting::query()
            ->where('project_id', $project->id)
            ->where('service', $service)
            ->get()
            ->map(SettingValueDTO::fromModel(...));
    }
}
