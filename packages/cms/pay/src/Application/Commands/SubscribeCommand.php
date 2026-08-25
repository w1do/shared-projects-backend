<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

final readonly class SubscribeCommand
{
    public function __construct(
        public string $userKey,
        public string $planCode,
    ) {}
}
