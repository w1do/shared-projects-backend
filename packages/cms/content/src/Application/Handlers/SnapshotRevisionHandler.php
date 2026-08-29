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
            // Состав снимка задаёт сама модель: у поста в него входят блоки,
            // у страницы их нет вовсе.
            'snapshot' => $command->model->revisionSnapshot(),
            'author_id' => $command->authorId,
            'created_at' => now(),
        ]);
    }
}
