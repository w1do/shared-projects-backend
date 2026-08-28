<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Requests\License;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Публичные activate/refresh (ТЗ 1.7): ключ и есть аутентификация,
 * `install_id` — 64 hex, генерируется машиной клиента.
 */
final class ActivationRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'key' => ['required', 'string', 'max:64'],
            'install_id' => ['required', 'string', 'regex:/^[0-9a-f]{64}$/'],
            'domain' => ['required', 'string', 'max:255'],
            'app_version' => ['required', 'string', 'regex:/^\d+\.\d+\.\d+$/'],
        ];
    }
}
