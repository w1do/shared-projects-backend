<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Domain\Models\Project;
use Spatie\Permission\Models\Role;

/** Команда-намерение: данные для DeleteRoleHandler. */
final readonly class DeleteRoleCommand
{
    public function __construct(
        public Project $project,
        public Role $role,
    ) {}
}
