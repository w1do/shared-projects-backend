<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Auth;

use Spatie\LaravelData\Data;

final class LoginDTO extends Data
{
    public function __construct(
        public string $email,
        public string $password,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
