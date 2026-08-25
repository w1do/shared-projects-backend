<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;

/**
 * Участник проекта по идентификатору оператора.
 *
 * Поиск идёт через отношение участников (И11): оператор, не состоящий в проекте,
 * даёт 404 — членство в чужом проекте не раскрывается.
 */
final class FindProjectMemberQuery
{
    public function handle(Project $project, int $memberId): Admin
    {
        /** @var Admin $member */
        $member = $project->members()->whereKey($memberId)->firstOrFail();

        return $member;
    }
}
