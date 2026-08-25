<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Role;

use Spatie\LaravelData\Data;

final class RolePermissionsDTO extends Data
{
    /** @param list<string> $permissions */
    public function __construct(public array $permissions) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }
}
