<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\UpsertReleaseCommand;
use Cms\Licensing\Application\Exceptions\ReleaseRuleViolation;
use Cms\Licensing\Domain\Models\Release;

/**
 * Создание/изменение релиза каталога: уникальность версии в проекте —
 * доменный инвариант; формат SemVer/трейна валидирует FormRequest.
 */
final class UpsertReleaseHandler
{
    public function handle(UpsertReleaseCommand $command): Release
    {
        $release = $command->release ?? new Release;

        $taken = Release::query()
            ->where('version', $command->version)
            ->when($release->exists, fn ($query) => $query->whereKeyNot($release->id))
            ->exists();
        if ($taken) {
            throw ReleaseRuleViolation::versionTaken();
        }

        $release->fill([
            'version' => $command->version,
            'train' => $command->train,
            'repository' => $command->repository,
            'released_at' => $command->releasedAt,
            'is_security' => $command->isSecurity,
            'min_upgrade_from' => $command->minUpgradeFrom,
            'changelog_url' => $command->changelogUrl,
        ])->save();

        return $release;
    }
}
