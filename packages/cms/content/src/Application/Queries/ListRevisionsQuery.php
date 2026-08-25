<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;
use Cms\Content\Domain\Models\Revision;
use Illuminate\Support\Collection;

final class ListRevisions
{
    public function handle(Post|Page $model): Collection
    {
        return $model->revisions()->orderByDesc('id')->get()->map(fn (Revision $r) => [
            'id' => $r->id,
            'snapshot' => $r->snapshot,
            'author_id' => $r->author_id,
            'created_at' => $r->created_at?->toIso8601String(),
        ]);
    }
}
