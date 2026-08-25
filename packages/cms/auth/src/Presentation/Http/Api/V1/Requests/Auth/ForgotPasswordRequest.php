<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/** Запрос ссылки на сброс пароля. */
final class ForgotPasswordRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return ['email' => ['required', 'email']];
    }
}
