<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;

/** Полная замена набора прав роли. */
final class RolePermissionsRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }
}
