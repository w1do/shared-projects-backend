<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\DeleteReleaseCommand;

/**
 * Удаление релиза из каталога: права лицензий не пересчитываются назад —
 * поднятая `entitled_version` уже сохранена в лицензиях (Д5).
 */
final class DeleteReleaseHandler
{
    public function handle(DeleteReleaseCommand $command): void
    {
        $command->release->delete();
    }
}
