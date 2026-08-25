<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Domain\Models\Project;

/** Команда-намерение: данные для ToggleServiceHandler. */
final readonly class ToggleServiceCommand
{
    public function __construct(
        public Project $project,
        public string $service,
        public bool $enabled,
    ) {}
}
