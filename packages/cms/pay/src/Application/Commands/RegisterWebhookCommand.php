<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

final readonly class RegisterWebhookCommand
{
    public function __construct(
        public string $provider,
        public string $externalId,
        public array $payload,
    ) {}
}
