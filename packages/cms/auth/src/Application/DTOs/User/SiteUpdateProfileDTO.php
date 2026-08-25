<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\User;

use Spatie\LaravelData\Attributes\Validation\RequiredWith;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class SiteUpdateProfileDTO extends Data
{
    public function __construct(
        public string|Optional $name,
        public string|Optional $password,
        #[RequiredWith('password')]
        public string|Optional $current_password,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'password' => ['sometimes', 'string', 'min:8'],
        ];
    }
}
