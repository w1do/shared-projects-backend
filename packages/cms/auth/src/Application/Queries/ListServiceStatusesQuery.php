<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Domain\Models\Project;
use Illuminate\Support\Collection;

final class ListServiceStatuses
{
    /** @return Collection<int, array{service: string, enabled: bool}> */
    public function handle(Project $project): Collection
    {
        $enabled = $project->enabledServices();
        $services = array_values(array_map('strval', (array) config('cms-auth.services', [])));

        return collect($services)
            ->map(fn (string $service) => ['service' => $service, 'enabled' => in_array($service, $enabled, true)])
            ->values();
    }
}
