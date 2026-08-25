<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\Auth\ResetPasswordDTO;

/** Команда-намерение: данные для ResetAdminPasswordHandler. */
final readonly class ResetAdminPasswordCommand
{
    public function __construct(
        public ResetPasswordDTO $data,
    ) {}
}
