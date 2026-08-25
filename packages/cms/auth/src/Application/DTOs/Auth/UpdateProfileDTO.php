<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Auth;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class UpdateProfileDTO extends Data
{
    public function __construct(
        public string|Optional $name,
        public string|Optional $locale,
        public string|Optional $password,
        public string|Optional $current_password,
    ) {}

}
