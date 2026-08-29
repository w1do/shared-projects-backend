<?php

declare(strict_types=1);

namespace Cms\Research\Application\Queries;

use Cms\Research\Domain\Models\Research;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/** Чтение одного исследования: чужое неотличимо от несуществующего. */
final readonly class GetResearchQuery
{
    public function handle(int $researchId, bool $withSources = false): Research
    {
        $query = Research::query()->withCount(['sources', 'topics'])->whereKey($researchId);

        if ($withSources) {
            $query->with(['sources' => static fn ($relation) => $relation->orderBy('position')]);
        }

        $research = $query->first();

        if ($research === null) {
            throw (new ModelNotFoundException)->setModel(Research::class, [$researchId]);
        }

        return $research;
    }
}
