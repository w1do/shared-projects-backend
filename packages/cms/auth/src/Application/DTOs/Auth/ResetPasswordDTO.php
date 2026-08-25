<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Auth;

use Spatie\LaravelData\Data;

final class ResetPasswordDTO extends Data
{
    public function __construct(
        public string $email,
        public string $token,
        public string $password,
    ) {}

}
