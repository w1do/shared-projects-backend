<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\Revision\RevisionDTO;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;
use Illuminate\Support\Collection;

final class ListRevisionsQuery
{
    /**
     * История ревизий носителя, новые первыми (порядок зафиксирован снимками).
     *
     * @return Collection<int, RevisionDTO>
     */
    public function handle(Post|Page $model): Collection
    {
        return $model->revisions()->orderByDesc('id')->get()->map(RevisionDTO::fromModel(...));
    }
}
