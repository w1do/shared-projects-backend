<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\Member\InviteMemberDTO;
use Cms\Auth\Domain\Models\Project;

/** Команда-намерение: данные для InviteMemberHandler. */
final readonly class InviteMemberCommand
{
    public function __construct(
        public Project $project,
        public InviteMemberDTO $data,
    ) {}
}
