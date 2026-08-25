<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\User;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class SiteRegisterDTO extends Data
{
    public function __construct(
        public string $email,
        public string $password,
        public string|Optional $name,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8'],
            'name' => ['sometimes', 'string', 'max:255'],
        ];
    }
}
