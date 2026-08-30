<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

/** Команда-намерение: привести каталог прав и системные роли к манифестам. */
final readonly class SyncPermissionsCommand
{
    public function __construct(public bool $prune = false) {}
}
