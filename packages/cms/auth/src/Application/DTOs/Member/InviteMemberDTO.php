<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Member;

use Spatie\LaravelData\Data;

final class InviteMemberDTO extends Data
{
    public function __construct(
        public string $email,
        public string $role,
        public ?string $name = null,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            // Оператора с таким email может ещё не быть — handler заведёт его.
            'email' => ['required', 'email', 'max:255'],
            'role' => ['required', 'string'],
            'name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
