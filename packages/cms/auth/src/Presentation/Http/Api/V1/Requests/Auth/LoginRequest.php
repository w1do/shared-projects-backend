<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/** Вход: общий для оператора и пользователя сайта — форма запроса одна и та же. */
final class LoginRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
