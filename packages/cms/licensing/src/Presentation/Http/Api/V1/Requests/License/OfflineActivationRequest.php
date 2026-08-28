<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Requests\License;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Офлайн-активация (ТЗ 2.7): консоль разбирает файл-запрос установки
 * и передаёт его поля; `requested_at` файла информативен и не принимается.
 */
final class OfflineActivationRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'install_id' => ['required', 'string', 'regex:/^[0-9a-f]{64}$/'],
            'domain' => ['required', 'string', 'max:255'],
            'app_version' => ['sometimes', 'nullable', 'string', 'regex:/^\d+\.\d+\.\d+$/'],
        ];
    }
}
