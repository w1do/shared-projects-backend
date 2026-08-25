<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\DeleteCategoryCommand;

final class DeleteCategoryHandler
{
    public function handle(DeleteCategoryCommand $command): void
    {
        $command->category->delete(); // nested set удаляет поддерево
    }
}
