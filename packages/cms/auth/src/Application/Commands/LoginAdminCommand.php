<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\Auth\LoginDTO;

/** Команда-намерение: данные для LoginAdminHandler. */
final readonly class LoginAdminCommand
{
    public function __construct(
        public LoginDTO $data,
        public string $ip,
    ) {}
}
