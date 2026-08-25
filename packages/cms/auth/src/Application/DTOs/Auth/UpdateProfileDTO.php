<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Auth;

use Spatie\LaravelData\Attributes\Validation\RequiredWith;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class UpdateProfileDTO extends Data
{
    public function __construct(
        public string|Optional $name,
        public string|Optional $locale,
        public string|Optional $password,
        #[RequiredWith('password')]
        public string|Optional $current_password,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'locale' => ['sometimes', 'string', 'max:10'],
            'password' => ['sometimes', 'string', 'min:8'],
        ];
    }
}
