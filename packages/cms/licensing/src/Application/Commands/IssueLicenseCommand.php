<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use DateTimeInterface;

/**
 * Выпуск perpetual-лицензии: entitlements снимаются с плана в момент выпуска.
 * `encryptKey` — авто-выпуск листенером подписки (Д8): plaintext-ключ некому
 * вернуть, он сохраняется шифрованным до первого показа оператором.
 */
final readonly class IssueLicenseCommand
{
    public function __construct(
        public Organization $organization,
        public Plan $plan,
        public DateTimeInterface $updatesUntil,
        public int $maxInstallations = 1,
        public ?string $entitledVersion = null,
        public ?string $note = null,
        public bool $encryptKey = false,
    ) {}
}
