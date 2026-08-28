<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Domain\Models\Release;

/** Релиз проекта по id: чужой релиз не находится и даёт 404. */
final class FindReleaseQuery
{
    public function handle(int $releaseId): Release
    {
        return Release::query()->findOrFail($releaseId);
    }
}
