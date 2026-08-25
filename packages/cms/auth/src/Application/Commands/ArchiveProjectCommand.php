<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Domain\Models\Project;

/** Команда-намерение: данные для ArchiveProjectHandler. */
final readonly class ArchiveProjectCommand
{
    public function __construct(
        public Project $project,
    ) {}
}
