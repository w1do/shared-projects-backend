<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Requests\License;

use Illuminate\Foundation\Http\FormRequest;

/** Публичная валидация: вход — только активационный ключ (Д6). */
final class ValidateLicenseRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'key' => ['required', 'string', 'max:64'],
        ];
    }
}
