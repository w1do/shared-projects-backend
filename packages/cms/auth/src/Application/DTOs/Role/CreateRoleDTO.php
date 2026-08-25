<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Role;

use Spatie\LaravelData\Data;

final class CreateRoleDTO extends Data
{
    /** @param list<string> $permissions */
    public function __construct(
        public string $name,
        public array $permissions,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:64', 'alpha_dash'],
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }
}
