<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\Auth\ResetPasswordDTO;

/** Команда-намерение: данные для ResetSitePasswordHandler. */
final readonly class ResetSitePasswordCommand
{
    public function __construct(
        public string $projectId,
        public ResetPasswordDTO $data,
    ) {}
}
