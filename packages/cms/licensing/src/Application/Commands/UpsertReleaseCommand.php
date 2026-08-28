<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Domain\Models\Release;
use DateTimeInterface;

/** Создание/изменение релиза каталога: `release === null` — создание. */
final readonly class UpsertReleaseCommand
{
    public function __construct(
        public ?Release $release,
        public string $version,
        public string $train,
        public string $repository,
        public DateTimeInterface $releasedAt,
        public bool $isSecurity = false,
        public ?string $minUpgradeFrom = null,
        public ?string $changelogUrl = null,
    ) {}
}
