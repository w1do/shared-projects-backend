<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\SnapshotRevisionCommand;
use Cms\Content\Domain\Models\Revision;

final class SnapshotRevisionHandler
{
    public function handle(SnapshotRevisionCommand $command): Revision
    {
        /** @var Revision */
        return $command->model->revisions()->create([
            'project_id' => $command->model->project_id,
            'snapshot' => $command->model->only(['title', 'slug', 'body', 'locale', 'status']),
            'author_id' => $command->authorId,
            'created_at' => now(),
        ]);
    }
}
