<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan;
use DateTimeInterface;

final readonly class IssueLicenseCommand
{
    public function __construct(
        public Organization $organization,
        public Plan $plan,
        public DateTimeInterface $expiresAt,
    ) {}
}
