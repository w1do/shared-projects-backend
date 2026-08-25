<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Application\DTOs\Service\ServiceStatusDTO;
use Cms\Auth\Domain\Models\Project;
use Illuminate\Support\Collection;

final class ListServiceStatusesQuery
{
    /** @return Collection<int, ServiceStatusDTO> */
    public function handle(Project $project): Collection
    {
        $enabled = $project->enabledServices();
        $services = array_values(array_map('strval', (array) config('cms-auth.services', [])));

        return collect($services)
            ->map(fn (string $service) => new ServiceStatusDTO($service, in_array($service, $enabled, true)))
            ->values();
    }
}
