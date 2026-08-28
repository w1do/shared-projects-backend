<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Domain\Models\License;
use DateTimeInterface;

/**
 * Продление окна обновлений (Д5): сдвиг `updates_until` вперёд и подъём
 * сохранённой `entitled_version`; активационный ключ не меняется.
 */
final readonly class RenewLicenseCommand
{
    public function __construct(
        public License $license,
        public DateTimeInterface $updatesUntil,
    ) {}
}
