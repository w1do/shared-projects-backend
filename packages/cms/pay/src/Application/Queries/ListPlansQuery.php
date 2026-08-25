<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Queries;

use Cms\Pay\Application\DTOs\Plan\PlanDTO;
use Cms\Pay\Domain\Models\Plan;
use Illuminate\Support\Collection;

final class ListPlansQuery
{
    /** @return Collection<int, PlanDTO> */
    public function handle(bool $includeArchived = false): Collection
    {
        return Plan::query()
            ->with(['options', 'features'])
            ->when(! $includeArchived, fn ($q) => $q->whereNull('archived_at'))
            ->orderBy('price_minor')
            ->get()
            ->map(PlanDTO::fromModel(...));
    }
}
