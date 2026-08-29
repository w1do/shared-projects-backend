<?php

declare(strict_types=1);

namespace Cms\Research\Application\Queries;

use Cms\Research\Application\DTOs\Research\ResearchDTO;
use Cms\Research\Domain\Models\Research;

/** Список исследований проекта: скоуп проекта даёт глобальный scope модели. */
final readonly class ListResearchesQuery
{
    /** @return list<ResearchDTO> */
    public function handle(?string $status = null): array
    {
        $query = Research::query()->withCount(['sources', 'topics']);

        if ($status !== null && $status !== '') {
            $query->where('status', $status);
        }

        return $query
            ->orderByDesc('id')
            ->get()
            ->map(static fn (Research $research): ResearchDTO => ResearchDTO::fromModel($research))
            ->all();
    }
}
