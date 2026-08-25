<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;

/** Команда-намерение: данные для RemoveMemberHandler. */
final readonly class RemoveMemberCommand
{
    public function __construct(
        public Project $project,
        public Admin $member,
    ) {}
}
