<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Правила приёма анкеты организации. Обязательны название, контактное лицо
 * и e-mail; остальные поля анкеты опциональны (Optional-семантика И1:
 * непереданные ключи не попадают в validated()).
 */
final class UpsertOrganizationRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'contact_first_name' => ['required', 'string', 'max:255'],
            'contact_last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:32'],
            'telegram' => ['sometimes', 'nullable', 'string', 'max:64'],
            'activity' => ['sometimes', 'nullable', 'string', 'max:255'],
            'employees_count' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'usage_purpose' => ['sometimes', 'nullable', 'string', 'max:512'],
        ];
    }
}
