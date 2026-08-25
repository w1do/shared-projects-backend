<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

use Cms\Pay\Domain\ValueObjects\SiteUserKey;

final readonly class SubscribeCommand
{
    public function __construct(
        public SiteUserKey $userKey,
        public string $planCode,
    ) {}
}
