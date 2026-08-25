<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Application\DTOs\Auth\ForgotPasswordDTO;

/** Команда-намерение: данные для ForgotAdminPasswordHandler. */
final readonly class ForgotAdminPasswordCommand
{
    public function __construct(
        public ForgotPasswordDTO $data,
    ) {}
}
