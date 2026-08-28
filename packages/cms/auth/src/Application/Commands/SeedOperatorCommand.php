<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

/** Команда-намерение: данные для SeedOperatorHandler. */
final readonly class SeedOperatorCommand
{
    public function __construct(
        public string $email,
        public string $password,
    ) {}
}
