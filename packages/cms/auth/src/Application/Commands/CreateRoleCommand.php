<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\Role\CreateRoleDTO;
use Cms\Auth\Domain\Models\Project;

/** Команда-намерение: данные для CreateRoleHandler. */
final readonly class CreateRoleCommand
{
    public function __construct(
        public Project $project,
        public CreateRoleDTO $data,
    ) {}
}
