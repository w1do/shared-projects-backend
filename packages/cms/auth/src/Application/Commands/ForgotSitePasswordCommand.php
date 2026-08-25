<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\Auth\ForgotPasswordDTO;

/** Команда-намерение: данные для ForgotSitePasswordHandler. */
final readonly class ForgotSitePasswordCommand
{
    public function __construct(
        public string $projectId,
        public ForgotPasswordDTO $data,
    ) {}
}
