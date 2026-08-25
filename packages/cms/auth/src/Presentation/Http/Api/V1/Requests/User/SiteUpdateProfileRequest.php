<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Профиль пользователя сайта. `current_password` — см. `UpdateProfileRequest`:
 * implicit-правило `required_with` без `sometimes`, сообщение дословное.
 */
final class SiteUpdateProfileRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'password' => ['sometimes', 'string', 'min:8'],
            'current_password' => ['required_with:password', 'string'],
        ];
    }
}
