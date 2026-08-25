<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\User\SiteRegisterDTO;

/** Команда-намерение: данные для RegisterSiteUserHandler. */
final readonly class RegisterSiteUserCommand
{
    public function __construct(
        public string $projectId,
        public SiteRegisterDTO $data,
    ) {}
}
