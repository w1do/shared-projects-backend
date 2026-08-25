<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

/** Регистрация пользователя сайта. */
final class SiteRegisterRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8'],
            'name' => ['sometimes', 'string', 'max:255'],
        ];
    }
}
