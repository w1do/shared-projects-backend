<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\Revision\RevisionDTO;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;
use Cms\Content\Domain\Models\Revision;
use Illuminate\Support\Collection;

final class ListRevisionsQuery
{
    /**
     * История ревизий носителя, новые первыми; номер версии считается
     * от первой по времени создания, поэтому не зависит от ключа таблицы.
     *
     * @return Collection<int, RevisionDTO>
     */
    public function handle(Post|Page $model): Collection
    {
        return $model->revisions()
            ->orderBy('created_at')
            ->orderBy('id')
            ->get()
            ->values()
            ->map(fn (Revision $revision, int $index): RevisionDTO => RevisionDTO::fromModel($revision, $index + 1))
            ->reverse()
            ->values();
    }
}
