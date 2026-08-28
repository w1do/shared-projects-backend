<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Domain\Models\Release;

/** Удаление релиза из каталога проекта. */
final readonly class DeleteReleaseCommand
{
    public function __construct(public Release $release) {}
}
