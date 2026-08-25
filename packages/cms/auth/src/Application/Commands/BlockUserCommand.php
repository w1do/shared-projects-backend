<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Auth\Domain\Models\User;

/** Команда-намерение: данные для BlockUserHandler. */
final readonly class BlockUserCommand
{
    public function __construct(
        public User $user,
        public bool $blocked,
    ) {}
}
