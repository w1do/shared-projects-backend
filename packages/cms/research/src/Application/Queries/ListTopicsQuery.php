<?php

declare(strict_types=1);

namespace Cms\Research\Application\Queries;

use Cms\Research\Application\DTOs\Topic\TopicDTO;
use Cms\Research\Domain\Models\ResearchTopic;

/** Темы проекта: всего или по одному исследованию. */
final readonly class ListTopicsQuery
{
    /** @return list<TopicDTO> */
    public function handle(?int $researchId = null, ?string $status = null): array
    {
        $query = ResearchTopic::query();

        if ($researchId !== null) {
            $query->where('research_id', $researchId);
        }

        if ($status !== null && $status !== '') {
            $query->where('status', $status);
        }

        return $query
            ->orderByDesc('id')
            ->get()
            ->map(static fn (ResearchTopic $topic): TopicDTO => TopicDTO::fromModel($topic))
            ->all();
    }
}
