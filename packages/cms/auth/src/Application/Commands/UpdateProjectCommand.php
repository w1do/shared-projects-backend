<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\Project\UpdateProjectDTO;
use Cms\Auth\Domain\Models\Project;

/** Команда-намерение: данные для UpdateProjectHandler. */
final readonly class UpdateProjectCommand
{
    public function __construct(
        public Project $project,
        public UpdateProjectDTO $data,
    ) {}
}
