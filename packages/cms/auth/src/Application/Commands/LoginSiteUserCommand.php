<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\Auth\LoginDTO;

/** Команда-намерение: данные для LoginSiteUserHandler. */
final readonly class LoginSiteUserCommand
{
    public function __construct(
        public string $projectId,
        public LoginDTO $data,
        public string $ip,
    ) {}
}
