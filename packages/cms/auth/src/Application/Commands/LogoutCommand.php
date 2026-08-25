<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\User;

/** Команда-намерение: данные для LogoutHandler. */
final readonly class LogoutCommand
{
    public function __construct(
        public Admin|User $subject,
    ) {}
}
