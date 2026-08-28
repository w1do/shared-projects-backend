<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

final readonly class RegisterWebhookCommand
{
    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, string>|null  $auth  слепок авторизации callback (Д6)
     */
    public function __construct(
        public string $provider,
        public string $externalId,
        public array $payload,
        public ?array $auth = null,
    ) {}
}
