<?php

declare(strict_types=1);

namespace Cms\Research\Application\Queries;

use Cms\Research\Domain\Models\ProjectBuildout;

/** Последняя сборка проекта: её состояние опрашивает консоль. */
final readonly class GetBuildoutQuery
{
    public function handle(): ?ProjectBuildout
    {
        return ProjectBuildout::query()->orderByDesc('id')->first();
    }
}
