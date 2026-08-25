<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;

/** Команда-намерение: данные для AssignMemberRoleHandler. */
final readonly class AssignMemberRoleCommand
{
    public function __construct(
        public Project $project,
        public Admin $member,
        public string $role,
    ) {}
}
