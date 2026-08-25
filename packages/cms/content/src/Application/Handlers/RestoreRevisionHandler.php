<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\RestoreRevisionCommand;
use Cms\Content\Application\Commands\SnapshotRevisionCommand;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;

final class RestoreRevisionHandler
{
    public function __construct(private readonly SnapshotRevisionHandler $snapshot) {}

    public function handle(RestoreRevisionCommand $command): Post|Page
    {
        $command->model->fill(array_intersect_key((array) $command->revision->snapshot, array_flip(['title', 'slug', 'body', 'locale'])));
        $command->model->save();

        // Восстановление — тоже сохранение: новая ревизия
        $this->snapshot->handle(new SnapshotRevisionCommand($command->model, $command->authorId));

        return $command->model;
    }
}
